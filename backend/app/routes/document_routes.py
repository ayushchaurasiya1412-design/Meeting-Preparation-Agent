import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.utils.auth_handler import verify_token
from app.models.document import Document
from app.models.user import User
from fastapi.responses import FileResponse
import shutil

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def format_size(size_bytes):
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"

@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    email = payload.get("sub")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    file_path = os.path.join(UPLOAD_DIR, f"{db_user.id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size_bytes = os.path.getsize(file_path)
    
    new_doc = Document(
        user_id=db_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=format_size(file_size_bytes),
        content_type=file.content_type
    )
    
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    return {
        "message": "File uploaded successfully",
        "document": {
            "id": new_doc.id,
            "name": new_doc.filename,
            "size": new_doc.file_size,
            "date": new_doc.uploaded_at.strftime("%b %d, %Y")
        }
    }

@router.get("/")
def get_documents(
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    email = payload.get("sub")
    db_user = db.query(User).filter(User.email == email).first()
    
    documents = db.query(Document).filter(Document.user_id == db_user.id).order_by(Document.uploaded_at.desc()).all()
    
    return [
        {
            "id": doc.id,
            "name": doc.filename,
            "size": doc.file_size,
            "date": doc.uploaded_at.strftime("%b %d, %Y")
        } for doc in documents
    ]

@router.get("/{doc_id}/download")
def download_document(
    doc_id: int,
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    email = payload.get("sub")
    db_user = db.query(User).filter(User.email == email).first()
    
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == db_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return FileResponse(path=doc.file_path, filename=doc.filename)

@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    email = payload.get("sub")
    db_user = db.query(User).filter(User.email == email).first()
    
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == db_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    try:
        os.remove(doc.file_path)
    except FileNotFoundError:
        pass
        
    db.delete(doc)
    db.commit()
    
    return {"message": "Document deleted"}
