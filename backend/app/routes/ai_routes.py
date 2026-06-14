from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.meeting_note import MeetingNote
from app.models.meeting import Meeting
from app.models.client import Client
from app.models.action_item import ActionItem

from app.schemas.ai_schema import (
    AgendaRequest,
    SummaryRequest,
    ActionItemRequest,
    EmailRequest,
    MeetingAnalysisRequest,
    RiskAnalysisRequest,
    SentimentAnalysisRequest,
    MeetingInsightsRequest,
    ClientReadinessRequest,
    ProjectComplexityRequest,
    MeetingHealthRequest,
    RecommendationRequest,
    SuperAnalysisRequest,
    TaskAssignmentRequest,
    SuperAnalysisByIdRequest
)

from app.services.ai_service import (
    client,
    generate_agenda,
    generate_summary,
    extract_action_items,
    generate_followup_email,
    analyze_risks,
    analyze_sentiment,
    generate_meeting_insights,
    analyze_client_readiness,
    analyze_project_complexity,
    analyze_meeting_health,
    assign_tasks,
    generate_recommendations

)

router = APIRouter()


# =====================================
# TEST ROUTE
# =====================================

@router.get("/test")
def test_ai():

    return {
        "message": "AI Route Working"
    }


# =====================================
# GENERATE AGENDA
# =====================================

@router.post("/generate-agenda")
def generate_meeting_agenda(
    request: AgendaRequest
):

    agenda = generate_agenda(
        request.company_name,
        request.meeting_topic
    )

    return {
        "agenda": agenda
    }


# =====================================
# GENERATE SUMMARY
# =====================================

@router.post("/generate-summary")
def generate_meeting_summary(
    request: SummaryRequest
):

    summary = generate_summary(
        request.meeting_notes
    )

    return {
        "summary": summary
    }


# =====================================
# GENERATE ACTION ITEMS
# =====================================

@router.post("/extract-action-items")
def generate_action_items(
    request: ActionItemRequest
):

    action_items = extract_action_items(
        request.meeting_notes
    )

    return {
        "action_items": action_items
    }


# =====================================
# GENERATE FOLLOWUP EMAIL
# =====================================

@router.post("/generate-followup-email")
def generate_email(
    request: EmailRequest
):

    email = generate_followup_email(
        request.client_name,
        request.meeting_summary
    )

    return {
        "email": email
    }


# =====================================
# AI AGENT - ANALYZE COMPLETE MEETING
# =====================================

@router.post("/analyze-meeting")
def analyze_meeting(
    request: MeetingAnalysisRequest,
    db: Session = Depends(get_db)
):

    try:

        # -----------------------------
        # FIND MEETING NOTE
        # -----------------------------

        note = db.query(MeetingNote).filter(
            MeetingNote.meeting_id == request.meeting_id
        ).first()

        if not note:
            return {
                "success": False,
                "error": "Meeting notes not found"
            }

        # -----------------------------
        # FIND MEETING
        # -----------------------------

        meeting = db.query(Meeting).filter(
            Meeting.id == request.meeting_id
        ).first()

        if not meeting:
            return {
                "success": False,
                "error": "Meeting not found"
            }

        # -----------------------------
        # FIND CLIENT
        # -----------------------------

        client = db.query(Client).filter(
            Client.id == meeting.client_id
        ).first()

        if not client:
            return {
                "success": False,
                "error": "Client not found"
            }

        # -----------------------------
        # AI SUMMARY
        # -----------------------------

        summary = generate_summary(
            note.notes
        )

        if not summary:
            return {
                "success": False,
                "error": "Summary generation failed"
            }

        if str(summary).startswith("Error:"):
            return {
                "success": False,
                "error": summary
            }

        # -----------------------------
        # AI ACTION ITEMS
        # -----------------------------

        action_items_text = extract_action_items(
            note.notes
        )

        if not action_items_text:
            action_items_text = ""

        if str(action_items_text).startswith("Error:"):
            action_items_text = ""

        action_items_list = [
            item.strip()
            for item in action_items_text.split("\n")
            if item.strip()
        ]

        # -----------------------------
        # SAVE ACTION ITEMS
        # -----------------------------

        saved_items = []

        for task in action_items_list:

            new_action_item = ActionItem(
                meeting_id=request.meeting_id,
                task=task,
                assigned_to="Ayush"
            )

            db.add(new_action_item)

            saved_items.append(task)

        db.commit()

        # -----------------------------
        # AI EMAIL
        # -----------------------------

        email = generate_followup_email(
            client.company_name,
            summary
        )

        if not email:
            email = "Email generation failed."

        if str(email).startswith("Error:"):
            email = "Email generation failed."

        # -----------------------------
        # RESPONSE
        # -----------------------------

        return {
            "success": True,
            "meeting_id": meeting.id,
            "client_name": client.company_name,
            "meeting_title": meeting.title,
            "summary": summary,
            "action_items": saved_items,
            "email": email
        }

    except Exception as e:

        db.rollback()

        return {
            "success": False,
            "error": str(e)
        }
    
    # =====================================
# RISK ANALYSIS
# =====================================

@router.post("/analyze-risks")
def risk_analysis(
    request: RiskAnalysisRequest
):

    risks = analyze_risks(
        request.meeting_notes
    )

    if not risks:
        return {
            "success": False,
            "error": "Risk analysis failed"
        }

    return {
        "success": True,
        "risk_analysis": risks
    }


# =====================================
# SENTIMENT ANALYSIS
# =====================================

@router.post("/analyze-sentiment")
def sentiment_analysis(
    request: SentimentAnalysisRequest
):

    sentiment = analyze_sentiment(
        request.meeting_notes
    )

    if not sentiment:
        return {
            "success": False,
            "error": "Sentiment analysis failed"
        }

    return {
        "success": True,
        "sentiment_analysis": sentiment
    }

@router.get("/test-groq")
def test_groq():

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": "Hello"
            }
        ]
    )

    return {
        "response": response.choices[0].message.content

    }
# =====================================
# MEETING INSIGHTS
# =====================================

@router.post("/meeting-insights")
def meeting_insights(
    request: MeetingInsightsRequest
):

    insights = generate_meeting_insights(
        request.meeting_notes
    )

    if not insights:
        return {
            "success": False,
            "error": "Meeting insights generation failed"
        }

    return {
        "success": True,
        "insights": insights
    }

# =====================================
# CLIENT READINESS SCORE
# =====================================

@router.post("/client-readiness")
def client_readiness(
    request: ClientReadinessRequest
):

    readiness = analyze_client_readiness(
        request.meeting_notes
    )

    if not readiness:
        return {
            "success": False,
            "error": "Client readiness analysis failed"
        }

    return {
        "success": True,
        "client_readiness": readiness
    }

# =====================================
# PROJECT COMPLEXITY ANALYSIS
# =====================================

@router.post("/project-complexity")
def project_complexity(
    request: ProjectComplexityRequest
):

    complexity = analyze_project_complexity(
        request.meeting_notes
    )

    if not complexity:
        return {
            "success": False,
            "error": "Project complexity analysis failed"
        }

    return {
        "success": True,
        "project_complexity": complexity
    }
# =====================================
# MEETING HEALTH SCORE
# =====================================

@router.post("/meeting-health")
def meeting_health(
    request: MeetingHealthRequest
):

    health = analyze_meeting_health(
        request.meeting_notes
    )

    if not health:
        return {
            "success": False,
            "error": "Meeting health analysis failed"
        }

    return {
        "success": True,
        "meeting_health": health
    }

# =====================================
# AI RECOMMENDATIONS
# =====================================

@router.post("/recommendations")
def recommendations(
    request: RecommendationRequest
):

    result = generate_recommendations(
        request.meeting_notes
    )

    if not result:
        return {
            "success": False,
            "error": "Recommendation generation failed"
        }

    return {
        "success": True,
        "recommendations": result
    }

# =====================================
# SMART TASK ASSIGNMENT
# =====================================

@router.post("/assign-tasks")
def smart_task_assignment(
    request: TaskAssignmentRequest
):

    tasks = assign_tasks(
        request.meeting_notes
    )

    if not tasks:
        return {
            "success": False,
            "error": "Task assignment failed"
        }

    return {
        "success": True,
        "assigned_tasks": tasks
    }
# =====================================
# SUPER AI AGENT
# =====================================

@router.post("/super-analysis")
def super_analysis(
    request: SuperAnalysisRequest
):

    summary = generate_summary(
        request.meeting_notes
    )

    action_items = extract_action_items(
        request.meeting_notes
    )

    risks = analyze_risks(
        request.meeting_notes
    )

    sentiment = analyze_sentiment(
        request.meeting_notes
    )

    insights = generate_meeting_insights(
        request.meeting_notes
    )

    readiness = analyze_client_readiness(
        request.meeting_notes
    )

    complexity = analyze_project_complexity(
        request.meeting_notes
    )

    health = analyze_meeting_health(
        request.meeting_notes
    )

    recommendations = generate_recommendations(
        request.meeting_notes
    )

    tasks = assign_tasks(
        request.meeting_notes
    )

    email = generate_followup_email(
        request.client_name,
        summary
    )

    return {
        "success": True,
        "summary": summary,
        "action_items": action_items,
        "risks": risks,
        "sentiment": sentiment,
        "insights": insights,
        "client_readiness": readiness,
        "project_complexity": complexity,
        "meeting_health": health,
        "recommendations": recommendations,
        "assigned_tasks": tasks,
        "followup_email": email
    }

# =====================================
# SUPER AI ANALYSIS BY MEETING ID
# =====================================

@router.post("/super-analysis-by-id")
def super_analysis_by_id(
    request: SuperAnalysisByIdRequest,
    db: Session = Depends(get_db)
):

    note = db.query(MeetingNote).filter(
        MeetingNote.meeting_id == request.meeting_id
    ).first()

    if not note:
        return {
            "success": False,
            "error": "Meeting notes not found"
        }

    meeting = db.query(Meeting).filter(
        Meeting.id == request.meeting_id
    ).first()

    if not meeting:
        return {
            "success": False,
            "error": "Meeting not found"
        }

    client_data = db.query(Client).filter(
        Client.id == meeting.client_id
    ).first()

    if not client_data:
        return {
            "success": False,
            "error": "Client not found"
        }

    summary = generate_summary(note.notes)

    action_items = extract_action_items(note.notes)

    risks = analyze_risks(note.notes)

    sentiment = analyze_sentiment(note.notes)

    insights = generate_meeting_insights(note.notes)

    readiness = analyze_client_readiness(note.notes)

    complexity = analyze_project_complexity(note.notes)

    health = analyze_meeting_health(note.notes)

    recommendations = generate_recommendations(
        note.notes
    )

    tasks = assign_tasks(note.notes)

    email = generate_followup_email(
        client_data.company_name,
        summary
    )

    return {
        "success": True,
        "meeting_id": meeting.id,
        "client_name": client_data.company_name,
        "summary": summary,
        "action_items": action_items,
        "risks": risks,
        "sentiment": sentiment,
        "insights": insights,
        "client_readiness": readiness,
        "project_complexity": complexity,
        "meeting_health": health,
        "recommendations": recommendations,
        "assigned_tasks": tasks,
        "followup_email": email
    }