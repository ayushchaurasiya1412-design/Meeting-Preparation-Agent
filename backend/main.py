from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routes.user_routes import router as user_router
from app.routes.meeting_routes import router as meeting_router
from app.routes.client_routes import router as client_router
from app.routes.meeting_note_routes import router as meeting_note_router
from app.routes.action_item_routes import router as action_item_router
from app.routes.ai_routes import router as ai_router
from app.routes.report_routes import router as report_router
from app.routes.document_routes import router as document_router
from app.routes.dashboard_routes import router as dashboard_router

app = FastAPI(
    title="Meeting Preparation Agent"
)

# =========================
# CORS Configuration
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Static Files
# =========================
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "app", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# =========================
# Routes
# =========================

app.include_router(
    user_router,
    prefix="/api/users",
    tags=["Users"]
)

app.include_router(
    meeting_router,
    prefix="/api/meetings",
    tags=["Meetings"]
)

app.include_router(
    client_router,
    prefix="/api/clients",
    tags=["Clients"]
)

app.include_router(
    meeting_note_router,
    prefix="/api/meeting-notes",
    tags=["Meeting Notes"]
)

app.include_router(
    action_item_router,
    prefix="/api/action-items",
    tags=["Action Items"]
)

app.include_router(
    ai_router,
    prefix="/api/ai",
    tags=["AI"]
)

@app.get("/")
def home():
    return {
        "message": "Meeting Preparation Agent Backend Running"
    }
app.include_router(
    report_router,
    prefix="/api/reports",
    tags=["Reports"]
)

app.include_router(
    document_router,
    prefix="/api/documents",
    tags=["Documents"]
)

app.include_router(
    dashboard_router,
    prefix="/api/dashboard",
    tags=["Dashboard"]
)