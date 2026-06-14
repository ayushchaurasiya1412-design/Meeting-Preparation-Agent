from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil

from app.utils.jwt_handler import create_access_token
from app.schemas.user_schema import UserCreate, UserLogin, UserUpdate
from app.models.user import User
from app.database.dependencies import get_db
from app.utils.security import hash_password, verify_password
from app.utils.auth_handler import verify_token

router = APIRouter()


@router.get("/test")
def test():
    return {
        "message": "User Route Working Successfully"
    }


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        company=user.company,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User Registered Successfully",
        "user_id": new_user.id
    }


@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        user.password,
        db_user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )

    token = create_access_token(
        {
            "sub": db_user.email
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "name": db_user.name
    }
@router.get("/profile")
def get_profile(
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    email = payload.get("sub")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "company": db_user.company,
        "role": db_user.role,
        "phone": db_user.phone,
        "bio": db_user.bio,
        "timezone": db_user.timezone,
        "profile_photo": db_user.profile_photo,
        "created_at": db_user.created_at
    }

@router.put("/profile")
def update_profile(
    user_update: UserUpdate,
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    email = payload.get("sub")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.company is not None:
        db_user.company = user_update.company
    if user_update.role is not None:
        db_user.role = user_update.role
    if user_update.phone is not None:
        db_user.phone = user_update.phone
    if user_update.bio is not None:
        db_user.bio = user_update.bio
    if user_update.timezone is not None:
        db_user.timezone = user_update.timezone
        
    db.commit()
    db.refresh(db_user)
    
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "company": db_user.company,
            "role": db_user.role,
            "phone": db_user.phone,
            "bio": db_user.bio,
            "timezone": db_user.timezone,
            "profile_photo": db_user.profile_photo
        }
    }

PHOTO_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "photos")
os.makedirs(PHOTO_UPLOAD_DIR, exist_ok=True)

@router.post("/profile/photo")
def upload_profile_photo(
    file: UploadFile = File(...),
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    email = payload.get("sub")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    file_ext = file.filename.split(".")[-1]
    filename = f"{db_user.id}_avatar.{file_ext}"
    file_path = os.path.join(PHOTO_UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_user.profile_photo = f"/uploads/photos/{filename}"
    db.commit()
    db.refresh(db_user)
    
    return {
        "message": "Profile photo updated successfully",
        "profile_photo": db_user.profile_photo
    }

@router.delete("/profile/photo")
def remove_profile_photo(
    payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    email = payload.get("sub")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if db_user.profile_photo:
        filename = db_user.profile_photo.split("/")[-1]
        file_path = os.path.join(PHOTO_UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            
        db_user.profile_photo = None
        db.commit()
        db.refresh(db_user)
        
    return {"message": "Profile photo removed successfully"}