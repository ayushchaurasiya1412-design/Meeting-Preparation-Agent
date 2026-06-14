import os
from groq import Groq # type: ignore
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def safe_generate(prompt: str):

    try:

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.5
        )

        return response.choices[0].message.content

    except Exception as e:

        print("Groq Error:", e)

        return None

# GENERATE AGENDA
def generate_agenda(
    company_name: str,
    meeting_topic: str
):

    prompt = f"""
    Create a professional meeting agenda.

    Company: {company_name}

    Topic: {meeting_topic}

    Return only agenda points.
    """

    return safe_generate(prompt)


def generate_summary( meeting_notes: str
):

    prompt = f"""
    You are a professional meeting assistant.

    Analyze the following meeting notes and generate:

    1. Meeting Summary
    2. Key Decisions
    3. Next Steps

    Meeting Notes:

    {meeting_notes}
    """

    return safe_generate(prompt)

# EXTRACT ACTION ITEMS
def extract_action_items(
    meeting_notes: str
):

    prompt = f"""
    You are a professional project manager.

    Extract only action items from the meeting notes.

    Rules:
    - Return only action items
    - One action item per line
    - No explanation

    Meeting Notes:

    {meeting_notes}
    """

    return safe_generate(prompt)


# GENERATE FOLLOWUP EMAIL
def generate_followup_email(
    client_name: str,
    meeting_summary: str
):

    prompt = f"""
    Write a professional follow-up email.

    Client Name:
    {client_name}

    Meeting Summary:
    {meeting_summary}

    Include:
    - Thank you note
    - Key discussion points
    - Next steps
    - Professional closing

    Return only email.
    """

    return safe_generate(prompt)

# ANALYZE RISKS
def analyze_risks(
    meeting_notes: str
):

    prompt = f"""
    You are an expert project manager.

    Analyze the meeting notes and identify:

    1. Risks
    2. Risk Impact
    3. Suggested Mitigation

    Meeting Notes:

    {meeting_notes}

    Return in a professional format.
    """

    return safe_generate(prompt)

# ANALYZE SENTIMENT
def analyze_sentiment(
    meeting_notes: str
):

    prompt = f"""
    You are an expert business analyst.

    Analyze the client sentiment from the meeting notes.

    Return:

    1. Sentiment (Positive, Neutral, Negative)
    2. Confidence Percentage
    3. Reason

    Meeting Notes:

    {meeting_notes}
    """

    return safe_generate(prompt)

# MEETING INSIGHTS
def generate_meeting_insights(
    meeting_notes: str
):

    prompt = f"""
    Analyze the meeting notes and extract:

    1. Project Type
    2. Budget Status
    3. Timeline
    4. Priority Level
    5. Client Interest Level

    Meeting Notes:

    {meeting_notes}

    Return in professional format.
    """

    return safe_generate(prompt)

# CLIENT READINESS SCORE
def analyze_client_readiness(
    meeting_notes: str
):

    prompt = f"""
    You are a senior business consultant.

    Analyze the meeting notes and determine:

    1. Readiness Score (0-100)
    2. Readiness Status
       - Not Ready
       - Partially Ready
       - Ready
    3. Reason

    Meeting Notes:

    {meeting_notes}

    Return in professional format.
    """

    return safe_generate(prompt)

# PROJECT COMPLEXITY ANALYSIS
def analyze_project_complexity(
    meeting_notes: str
):

    prompt = f"""
    You are a senior software architect.

    Analyze the project complexity from the meeting notes.

    Return:

    1. Complexity Level
       - Low
       - Medium
       - High

    2. Complexity Score (0-100)

    3. Reason

    Meeting Notes:

    {meeting_notes}
    """

    return safe_generate(prompt)
# MEETING HEALTH SCORE
def analyze_meeting_health(
    meeting_notes: str
):

    prompt = f"""
    You are an expert meeting analyst.

    Analyze the meeting and provide:

    1. Meeting Health Score (0-100)
    2. Productivity Level
    3. Strengths
    4. Weaknesses
    5. Suggestions

    Meeting Notes:

    {meeting_notes}
    """

    return safe_generate(prompt)

# AI RECOMMENDATIONS
def generate_recommendations(
    meeting_notes: str
):

    prompt = f"""
    You are a senior business consultant.

    Analyze the meeting notes and provide:

    1. Recommendations
    2. Next Best Actions
    3. Important Follow-ups

    Meeting Notes:

    {meeting_notes}

    Return recommendations in bullet points.
    """

    return safe_generate(prompt)

# SMART TASK ASSIGNMENT
def assign_tasks(
    meeting_notes: str
):

    prompt = f"""
    You are an expert project manager.

    Analyze the meeting notes and identify:

    1. Person Name
    2. Assigned Task
    3. Priority

    Meeting Notes:

    {meeting_notes}

    Return in structured format.
    """

    return safe_generate(prompt)