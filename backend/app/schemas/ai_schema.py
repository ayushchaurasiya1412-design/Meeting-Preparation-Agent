from pydantic import BaseModel


class AgendaRequest(BaseModel):
    company_name: str
    meeting_topic: str


class SummaryRequest(BaseModel):
    meeting_notes: str


class ActionItemRequest(BaseModel):
    meeting_notes: str


class EmailRequest(BaseModel):
    client_name: str
    meeting_summary: str


class MeetingAnalysisRequest(BaseModel):
    meeting_id: int


class RiskAnalysisRequest(BaseModel):
    meeting_notes: str

class SentimentAnalysisRequest(BaseModel):
    meeting_notes: str

class MeetingInsightsRequest(BaseModel):
    meeting_notes: str

class ClientReadinessRequest(BaseModel):
    meeting_notes: str  

class ProjectComplexityRequest(BaseModel):
    meeting_notes: str

class MeetingHealthRequest(BaseModel):
    meeting_notes: str

class RecommendationRequest(BaseModel):
    meeting_notes: str

class TaskAssignmentRequest(BaseModel):
    meeting_notes: str

class SuperAnalysisRequest(BaseModel):
    meeting_notes: str
    client_name: str

class SuperAnalysisByIdRequest(BaseModel):
    meeting_id: int