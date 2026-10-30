import os
import tempfile
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from reportlab.platypus import (          # type: ignore
    SimpleDocTemplate, Paragraph, Spacer,
    HRFlowable, Table, TableStyle,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # type: ignore
from reportlab.lib.units import inch      # type: ignore
from reportlab.lib import colors          # type: ignore
from reportlab.lib.pagesizes import A4    # type: ignore
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY  # type: ignore

from app.database.dependencies import get_db
from app.models.meeting import Meeting
from app.models.meeting_note import MeetingNote
from app.models.client import Client
from app.models.action_item import ActionItem

from app.services.ai_service import (
    generate_summary,
    extract_action_items,
    analyze_risks,
    generate_followup_email,
    analyze_sentiment,
    analyze_client_readiness,
    analyze_project_complexity,
    analyze_meeting_health,
)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────
def clean_text(text: str) -> str:
    """Strip markdown and normalise newlines for ReportLab."""
    if not text:
        return "N/A"
    text = text.replace("**", "").replace("__", "").replace("##", "").replace("#", "")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # ReportLab uses <br/> for line breaks inside a Paragraph
    text = text.replace("\n", "<br/>")
    return text.strip()


def _violet():
    return colors.HexColor("#7c3aed")

def _light_violet():
    return colors.HexColor("#f5f3ff")

def _indigo():
    return colors.HexColor("#4f46e5")

def _slate():
    return colors.HexColor("#0f172a")

def _muted():
    return colors.HexColor("#64748b")

def _border():
    return colors.HexColor("#e2e8f0")

def _emerald():
    return colors.HexColor("#10b981")

def _amber():
    return colors.HexColor("#f59e0b")

def _rose():
    return colors.HexColor("#f43f5e")

def _sky():
    return colors.HexColor("#0ea5e9")


# ── Custom Styles ─────────────────────────────────────────────
def make_styles():
    base = getSampleStyleSheet()

    styles = {}

    styles["report_title"] = ParagraphStyle(
        "report_title",
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=_slate(),
        spaceAfter=4,
        alignment=TA_LEFT,
    )
    styles["report_subtitle"] = ParagraphStyle(
        "report_subtitle",
        fontName="Helvetica",
        fontSize=11,
        textColor=_muted(),
        spaceAfter=6,
        alignment=TA_LEFT,
    )
    styles["section_heading"] = ParagraphStyle(
        "section_heading",
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=_violet(),
        spaceBefore=18,
        spaceAfter=6,
    )
    styles["body"] = ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=9.5,
        textColor=_slate(),
        leading=14,
        spaceAfter=4,
        alignment=TA_JUSTIFY,
    )
    styles["bullet"] = ParagraphStyle(
        "bullet",
        fontName="Helvetica",
        fontSize=9.5,
        textColor=_slate(),
        leading=14,
        leftIndent=14,
        spaceAfter=3,
    )
    styles["label"] = ParagraphStyle(
        "label",
        fontName="Helvetica-Bold",
        fontSize=8,
        textColor=_muted(),
        spaceAfter=2,
    )
    styles["value"] = ParagraphStyle(
        "value",
        fontName="Helvetica",
        fontSize=9.5,
        textColor=_slate(),
        spaceAfter=8,
    )
    styles["footer"] = ParagraphStyle(
        "footer",
        fontName="Helvetica",
        fontSize=7.5,
        textColor=_muted(),
        alignment=TA_CENTER,
    )

    return styles


# ── Header Banner Table ───────────────────────────────────────
def build_header_banner(client_name: str, meeting_title: str,
                        meeting_date: str, styles: dict):
    """Top violet banner with meeting metadata."""
    rows = [
        [
            Paragraph("MeetPrep <b>AI</b>", ParagraphStyle(
                "logo", fontName="Helvetica-Bold", fontSize=13,
                textColor=colors.white,
            )),
            Paragraph("AI-Generated Intelligence Report", ParagraphStyle(
                "tag", fontName="Helvetica", fontSize=9,
                textColor=colors.HexColor("#c4b5fd"),
                alignment=TA_LEFT,
            )),
        ],
    ]
    banner = Table(rows, colWidths=[2.2*inch, 4.6*inch])
    banner.setStyle(TableStyle([
        ("BACKGROUND",  (0,0), (-1,-1), _violet()),
        ("TOPPADDING",  (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
        ("LEFTPADDING",   (0,0), (-1,-1), 18),
        ("RIGHTPADDING",  (0,0), (-1,-1), 18),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))

    # Info row
    info_rows = [[
        Paragraph(f"<b>Client:</b>  {client_name}", styles["value"]),
        Paragraph(f"<b>Meeting:</b>  {meeting_title}", styles["value"]),
        Paragraph(f"<b>Date:</b>  {meeting_date}", styles["value"]),
    ]]
    info_table = Table(info_rows, colWidths=[2.2*inch, 3*inch, 1.6*inch])
    info_table.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), _light_violet()),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 18),
        ("RIGHTPADDING",  (0,0), (-1,-1), 18),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))

    return [banner, info_table, Spacer(1, 14)]


# ── Section Header ────────────────────────────────────────────
def section(title: str, emoji: str, styles: dict) -> list:
    elements = []
    elements.append(HRFlowable(width="100%", thickness=1,
                                color=_border(), spaceAfter=4, spaceBefore=14))
    elements.append(
        Paragraph(f"{emoji}  {title}", styles["section_heading"])
    )
    return elements


# ── Colored Info Box ──────────────────────────────────────────
def info_box(label: str, value: str, bg_hex: str,
             text_hex: str, styles: dict) -> Table:
    rows = [[
        Paragraph(f"<b>{label}</b>", ParagraphStyle(
            "ib_label", fontName="Helvetica-Bold", fontSize=8,
            textColor=colors.HexColor(text_hex),
        )),
        Paragraph(value, ParagraphStyle(
            "ib_val", fontName="Helvetica", fontSize=9,
            textColor=colors.HexColor(text_hex), leading=13,
        )),
    ]]
    t = Table(rows, colWidths=[1.2*inch, 5.6*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), colors.HexColor(bg_hex)),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ]))
    return t


# ── Metric Row ────────────────────────────────────────────────
def metric_row(items: list, styles: dict) -> Table:
    """items = list of (label, value, color_hex)"""
    cells = []
    for label, val, color in items:
        cells.append(
            Paragraph(
                f"<font color='{color}'><b>{val}</b></font><br/>"
                f"<font size='7' color='#64748b'>{label}</font>",
                ParagraphStyle("mc", fontName="Helvetica", fontSize=11,
                               leading=16, alignment=TA_CENTER),
            )
        )
    col_w = 6.8 * inch / len(cells)
    t = Table([cells], colWidths=[col_w] * len(cells))
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), colors.HexColor("#fafbff")),
        ("BOX",           (0,0), (-1,-1), 0.8, _border()),
        ("INNERGRID",     (0,0), (-1,-1), 0.5, _border()),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    return t


# ── Main Endpoint ─────────────────────────────────────────────
@router.get("/download-report/{meeting_id}")
def download_report(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    # ── DB lookups ───────────────────────────────────────────
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    note = db.query(MeetingNote).filter(
        MeetingNote.meeting_id == meeting_id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Meeting notes not found")

    client = db.query(Client).filter(Client.id == meeting.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # saved action items from DB (skip re-generating if already exist)
    saved_actions = db.query(ActionItem).filter(
        ActionItem.meeting_id == meeting_id
    ).all()

    # ── AI calls (only what we actually use) ────────────────
    summary      = clean_text(generate_summary(note.notes))
    risks        = clean_text(analyze_risks(note.notes))
    email_draft  = clean_text(generate_followup_email(client.company_name, summary))
    sentiment    = clean_text(analyze_sentiment(note.notes))
    readiness    = clean_text(analyze_client_readiness(note.notes))
    complexity   = clean_text(analyze_project_complexity(note.notes))
    health       = clean_text(analyze_meeting_health(note.notes))

    # action items: prefer saved DB items, otherwise re-extract
    if saved_actions:
        action_items_list = [a.task for a in saved_actions]
    else:
        raw_items = extract_action_items(note.notes) or ""
        action_items_list = [
            line.strip() for line in raw_items.split("\n") if line.strip()
        ]

    # ── PDF build ────────────────────────────────────────────
    styles = make_styles()

    # use a temp file — no disk accumulation
    tmp = tempfile.NamedTemporaryFile(
        delete=False, suffix=".pdf",
        prefix=f"MeetPrep_Report_{meeting_id}_"
    )
    tmp.close()
    pdf_path = tmp.name

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=0.7*inch,
        leftMargin=0.7*inch,
        topMargin=0.6*inch,
        bottomMargin=0.6*inch,
    )

    meeting_date = (
        meeting.meeting_date.strftime("%B %d, %Y")
        if meeting.meeting_date else "N/A"
    )
    generated_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    content = []

    # ── 1. Header banner ─────────────────────────────────────
    content += build_header_banner(
        client.company_name, meeting.title, meeting_date, styles
    )

    # ── 2. AI Metrics row ────────────────────────────────────
    content.append(Spacer(1, 6))
    content.append(metric_row([
        ("Action Items",    str(len(action_items_list)), "#7c3aed"),
        ("Risk Level",      _extract_risk_level(risks),  "#f59e0b"),
        ("Sentiment",       _extract_sentiment(sentiment), "#10b981"),
        ("Client Readiness", _extract_readiness_score(readiness), "#0ea5e9"),
    ], styles))
    content.append(Spacer(1, 6))

    # ── 3. Executive Summary ─────────────────────────────────
    content += section("Executive Summary", "📝", styles)
    content.append(Paragraph(summary, styles["body"]))

    # ── 4. Action Items ───────────────────────────────────────
    content += section("Action Items", "✅", styles)
    if action_items_list:
        for item in action_items_list:
            content.append(Paragraph(f"• &nbsp; {item}", styles["bullet"]))
    else:
        content.append(Paragraph("No action items extracted.", styles["body"]))

    # ── 5. Risk Analysis ──────────────────────────────────────
    content += section("Risk Analysis", "⚠", styles)
    content.append(info_box(
        "Risk Analysis", risks,
        bg_hex="#fffbeb", text_hex="#92400e", styles=styles
    ))

    # ── 6. Sentiment Analysis ─────────────────────────────────
    content += section("Client Sentiment", "😊", styles)
    content.append(info_box(
        "Sentiment", sentiment,
        bg_hex="#ecfdf5", text_hex="#065f46", styles=styles
    ))

    # ── 7. Client Readiness ───────────────────────────────────
    content += section("Client Readiness Score", "🎯", styles)
    content.append(info_box(
        "Readiness", readiness,
        bg_hex="#f0f9ff", text_hex="#0c4a6e", styles=styles
    ))

    # ── 8. Project Complexity ─────────────────────────────────
    content += section("Project Complexity", "🔧", styles)
    content.append(info_box(
        "Complexity", complexity,
        bg_hex="#f5f3ff", text_hex="#4c1d95", styles=styles
    ))

    # ── 9. Meeting Health ─────────────────────────────────────
    content += section("Meeting Health", "💡", styles)
    content.append(info_box(
        "Health Score", health,
        bg_hex="#fff1f2", text_hex="#881337", styles=styles
    ))

    # ── 10. Follow-up Email ───────────────────────────────────
    content += section("Follow-up Email Draft", "📧", styles)
    content.append(Paragraph(email_draft, styles["body"]))

    # ── 11. Footer ────────────────────────────────────────────
    content.append(Spacer(1, 24))
    content.append(HRFlowable(width="100%", thickness=0.8,
                               color=_border(), spaceAfter=8))
    content.append(Paragraph(
        f"Generated by MeetPrep AI · LLaMA 3.3-70B · {generated_at}",
        styles["footer"]
    ))

    doc.build(content)

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"MeetPrep_Report_{client.company_name}_{meeting_id}.pdf",
        background=_cleanup_background(pdf_path),
    )


# ── PDF cleanup after response ────────────────────────────────
def _cleanup_background(path: str):
    """Return a starlette BackgroundTask that deletes the temp file."""
    from starlette.background import BackgroundTask
    return BackgroundTask(_delete_file, path)


def _delete_file(path: str):
    try:
        os.unlink(path)
    except Exception:
        pass


# ── Text parsers ──────────────────────────────────────────────
def _extract_risk_level(text: str) -> str:
    t = text.lower()
    if "high risk" in t or "high impact" in t:
        return "High"
    if "low risk" in t or "minimal" in t:
        return "Low"
    return "Medium"


def _extract_sentiment(text: str) -> str:
    t = text.lower()
    if "positive" in t:
        return "Positive"
    if "negative" in t:
        return "Negative"
    return "Neutral"


def _extract_readiness_score(text: str) -> str:
    import re
    nums = re.findall(r'\b(\d{1,3})\b', text)
    candidates = [int(n) for n in nums if 0 <= int(n) <= 100]
    if candidates:
        return f"{candidates[0]}%"
    t = text.lower()
    if "ready" in t:
        return "Ready"
    if "partial" in t:
        return "Partial"
    return "N/A"
