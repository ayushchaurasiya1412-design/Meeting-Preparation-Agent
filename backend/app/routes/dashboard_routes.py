from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta

from app.database.dependencies import get_db
from app.models.client import Client
from app.models.meeting import Meeting
from app.models.meeting_note import MeetingNote
from app.models.action_item import ActionItem

router = APIRouter()


# ─── Basic Stats ──────────────────────────────────────────────
@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    total_clients  = db.query(Client).count()
    total_meetings = db.query(Meeting).count()
    total_notes    = db.query(MeetingNote).count()
    total_actions  = db.query(ActionItem).count()
    completed      = db.query(ActionItem).filter(ActionItem.status == "Completed").count()

    return {
        "clients":   total_clients,
        "meetings":  total_meetings,
        "notes":     total_notes,
        "actions":   total_actions,
        "completed_actions": completed,
        "completion_rate": round((completed / total_actions * 100) if total_actions else 0, 1),
    }


# ─── Monthly Meetings (last 6 months) ─────────────────────────
@router.get("/monthly-meetings")
def monthly_meetings(db: Session = Depends(get_db)):
    results = []
    now = datetime.utcnow()

    for i in range(5, -1, -1):
        target = now - timedelta(days=30 * i)
        year, month = target.year, target.month
        count = (
            db.query(Meeting)
            .filter(
                extract("year",  Meeting.meeting_date) == year,
                extract("month", Meeting.meeting_date) == month,
            )
            .count()
        )
        results.append({
            "month": target.strftime("%b"),
            "meetings": count,
        })

    return results


# ─── Action Items Completion (last 6 months) ──────────────────
@router.get("/action-completion")
def action_completion(db: Session = Depends(get_db)):
    results = []
    now = datetime.utcnow()

    for i in range(5, -1, -1):
        target = now - timedelta(days=30 * i)
        year, month = target.year, target.month

        total = (
            db.query(ActionItem)
            .filter(
                extract("year",  ActionItem.created_at) == year,
                extract("month", ActionItem.created_at) == month,
            )
            .count()
        )
        done = (
            db.query(ActionItem)
            .filter(
                ActionItem.status == "Completed",
                extract("year",  ActionItem.created_at) == year,
                extract("month", ActionItem.created_at) == month,
            )
            .count()
        )
        results.append({
            "month":     target.strftime("%b"),
            "total":     total,
            "completed": done,
            "rate":      round((done / total * 100) if total else 0, 1),
        })

    return results


# ─── Industry Distribution ────────────────────────────────────
@router.get("/industry-distribution")
def industry_distribution(db: Session = Depends(get_db)):
    rows = (
        db.query(Client.industry, func.count(Client.id).label("count"))
        .filter(Client.industry.isnot(None))
        .group_by(Client.industry)
        .all()
    )
    if not rows:
        return [
            {"name": "Finance",     "value": 2},
            {"name": "Healthcare",  "value": 2},
            {"name": "Retail",      "value": 1},
            {"name": "Consulting",  "value": 1},
        ]
    return [{"name": r.industry, "value": r.count} for r in rows]


# ─── Upcoming Meetings (next 7 days) ──────────────────────────
@router.get("/upcoming-meetings")
def upcoming_meetings(db: Session = Depends(get_db)):
    now   = datetime.utcnow()
    week  = now + timedelta(days=7)

    meetings = (
        db.query(Meeting)
        .filter(Meeting.meeting_date >= now, Meeting.meeting_date <= week)
        .order_by(Meeting.meeting_date)
        .limit(5)
        .all()
    )

    result = []
    for m in meetings:
        client = db.query(Client).filter(Client.id == m.client_id).first()
        result.append({
            "id":           m.id,
            "title":        m.title,
            "client_name":  client.company_name if client else "—",
            "meeting_date": m.meeting_date.isoformat() if m.meeting_date else None,
            "agenda":       m.agenda,
        })
    return result


# ─── Recent Activity Feed ─────────────────────────────────────
@router.get("/activity-feed")
def activity_feed(db: Session = Depends(get_db)):
    events = []

    meetings = db.query(Meeting).order_by(Meeting.created_at.desc()).limit(4).all()
    for m in meetings:
        events.append({
            "type":  "meeting",
            "label": f"Meeting '{m.title}' scheduled",
            "time":  m.created_at.isoformat() if m.created_at else None,
            "color": "#7c3aed",
            "icon":  "📅",
        })

    clients = db.query(Client).order_by(Client.created_at.desc()).limit(3).all()
    for c in clients:
        events.append({
            "type":  "client",
            "label": f"Client '{c.company_name}' added",
            "time":  c.created_at.isoformat() if c.created_at else None,
            "color": "#0ea5e9",
            "icon":  "🏢",
        })

    actions = db.query(ActionItem).filter(ActionItem.status == "Completed").order_by(ActionItem.created_at.desc()).limit(3).all()
    for a in actions:
        events.append({
            "type":  "action",
            "label": f"Task completed: {a.task[:50]}",
            "time":  a.created_at.isoformat() if a.created_at else None,
            "color": "#10b981",
            "icon":  "✅",
        })

    notes = db.query(MeetingNote).order_by(MeetingNote.id.desc()).limit(2).all()
    for n in notes:
        events.append({
            "type":  "note",
            "label": f"Notes added for meeting #{n.meeting_id}",
            "time":  None,
            "color": "#f59e0b",
            "icon":  "📝",
        })

    # sort by time descending, None last
    events.sort(key=lambda x: x["time"] or "0000", reverse=True)
    return events[:8]
