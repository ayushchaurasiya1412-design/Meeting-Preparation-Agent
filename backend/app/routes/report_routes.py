from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from reportlab.platypus import ( # type: ignore
    SimpleDocTemplate,
    Paragraph,
    Spacer
)
from reportlab.lib.styles import getSampleStyleSheet # type: ignore

from app.database.dependencies import get_db

from app.models.meeting import Meeting
from app.models.meeting_note import MeetingNote
from app.models.client import Client

from app.services.ai_service import (
    generate_summary,
    extract_action_items,
    analyze_risks,
    generate_followup_email,
    analyze_sentiment,
    analyze_client_readiness,
    analyze_project_complexity,
    analyze_meeting_health
)

router = APIRouter()


def clean_text(text):

    if not text:
        return "N/A"

    text = text.replace("**", "")
    text = text.replace("#", "")
    text = text.replace("\n", "<br/>")

    return text


@router.get("/download-report/{meeting_id}")
def download_report(
    meeting_id: int,
    db: Session = Depends(get_db)
):

    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id
    ).first()

    if not meeting:
        return {
            "success": False,
            "error": "Meeting not found"
        }

    note = db.query(MeetingNote).filter(
        MeetingNote.meeting_id == meeting_id
    ).first()

    if not note:
        return {
            "success": False,
            "error": "Meeting notes not found"
        }

    client = db.query(Client).filter(
        Client.id == meeting.client_id
    ).first()

    if not client:
        return {
            "success": False,
            "error": "Client not found"
        }

    summary = generate_summary(note.notes)

    action_items = extract_action_items(note.notes)

    risks = analyze_risks(note.notes)

    email = generate_followup_email(
        client.company_name,
        summary
    )
    

    sentiment = analyze_sentiment(
        note.notes
    )

    readiness = analyze_client_readiness(
        note.notes
    )

    complexity = analyze_project_complexity(
        note.notes
    )

    health = analyze_meeting_health(
        note.notes
    )

    summary = clean_text(summary)
    risks = clean_text(risks)
    email = clean_text(email)
    action_items = clean_text(action_items)

    pdf_path = f"Meeting_Report_{meeting_id}.pdf"

    doc = SimpleDocTemplate(pdf_path)

    styles = getSampleStyleSheet()

    content = []

    # Header
    content.append(
        Paragraph(
            "Meeting Preparation Agent",
            styles["Title"]
        )
    )

    content.append(
        Paragraph(
            "AI Generated Meeting Intelligence Report",
            styles["Heading2"]
        )
    )

    content.append(Spacer(1, 20))

    # Meeting Info
    content.append(
        Paragraph(
            f"<b>Client:</b> {client.company_name}",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            f"<b>Meeting:</b> {meeting.title}",
            styles["Heading3"]
        )
    )

    content.append(Spacer(1, 20))

    # Summary
    content.append(
        Paragraph(
            "Executive Summary",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            summary,
            styles["BodyText"]
        )
    )

    content.append(Spacer(1, 15))

    # Action Items
    content.append(
        Paragraph(
            "Action Items",
            styles["Heading2"]
        )
    )

    items = action_items.split("<br/>")

    for item in items:

        if item.strip():

            content.append(
                Paragraph(
                    f"• {item}",
                    styles["BodyText"]
                )
            )

    content.append(Spacer(1, 15))

    # Risks
    content.append(
        Paragraph(
            "Risk Analysis",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            risks,
            styles["BodyText"]
        )
    )

    content.append(Spacer(1, 15))

    # Email
    content.append(
        Paragraph(
            "Follow Up Email",
            styles["Heading2"]
        )
    )

    content.append(
        Paragraph(
            email,
            styles["BodyText"]
        )
    )

    doc.build(content)

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=pdf_path
    )