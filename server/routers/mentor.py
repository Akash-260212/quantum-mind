import os
from fastapi import APIRouter
from server.schemas import MentorChatRequest
import google.generativeai as genai

router = APIRouter(prefix="/api/mentor", tags=["AI Mentor"])

api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "bn": "Bengali (বাংলা)"
}

@router.post("/chat")
def mentor_chat(req: MentorChatRequest):
    """
    Multilingual Quantum Mentor powered by Google Gemini API.
    Provides pedagogical explanations in English, Hindi, Tamil, Telugu, and Bengali.
    """
    lang_code = req.language or "en"
    lang_name = LANGUAGE_NAMES.get(lang_code, "English")

    system_instruction = f"""
    You are 'Quantum Mind Mentor', an expert pedagogical quantum computing mentor for university students.
    Explain quantum computing concepts intuitively without heavy unnecessary jargon.
    
    CRITICAL LANGUAGE INSTRUCTION:
    Respond in {lang_name}.
    - If Hindi ('hi'): Write in authentic Devanagari Hindi with technical English terms in parentheses (e.g. सुपरपोजिशन (Superposition), हैडामार्ड गेट (Hadamard Gate), एंटैंगलमेंट (Entanglement)).
    - If Tamil ('ta'): Write in Tamil script with technical terms (e.g. மேற்பொருந்துதல் (Superposition), கியூபிட் (Qubit)).
    - If Telugu ('te'): Write in Telugu script.
    - If Bengali ('bn'): Write in Bengali script.
    - If English ('en'): Write in clear, structured English.
    
    Current Circuit State: {req.circuitContext or 'Standard Ground State'}
    """

    if api_key:
        try:
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_instruction
            )
            response = model.generate_content(req.question)
            return {
                "source": "Google Gemini 1.5 Flash",
                "language": lang_code,
                "reply": response.text
            }
        except Exception as e:
            pass

    # High-speed pedagogical fallback when GEMINI_API_KEY is not set
    q_lower = req.question.lower()

    if lang_code == "hi":
        fallback_reply = (
            f"क्वांटम मेंटर (हिंदी):\n\n"
            f"आपके प्रश्न '{req.question}' के संदर्भ में, क्वांटम यांत्रिकी में सभी संक्रियाएं यूनिटरी मैट्रिसेस $U$ द्वारा संचालित होती हैं ($U^\\dagger U = I$).\n"
            f"सुपरपोजिशन अवस्था $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ में दोनों अवस्थाएं एक साथ उपस्थित रहती हैं जब तक कि मापन (Measurement) नहीं किया जाता।"
        )
    elif lang_code == "ta":
        fallback_reply = (
            f"குவாண்டம் வழிகாட்டி (தமிழ்):\n\n"
            f"உங்கள் கேள்வி '{req.question}'க்கு விளக்கம்: குவாண்டம் அமைப்புகள் யூனிட்டரி செயல்பாடுகள் ($U^\\dagger U = I$) மூலம் பாதுகாக்கப்படுகின்றன.\n"
            f"கியூபிட்கள் மேற்பொருந்துதல் (Superposition) நிலையில் இருக்கும் வரை இரு நிலைகளையும் ஒரே நேரத்தில் பிரதிபலிக்கின்றன."
        )
    else:
        fallback_reply = (
            f"### Quantum Mentor ({lang_name}):\n\n"
            f"Regarding your query on '{req.question}':\n\n"
            f"Quantum logic gates are represented by unitary matrices $U$ preserving vector norm $\\langle\\psi|\\psi\\rangle = 1$.\n"
            f"For example, Hadamard creates equal superposition $(|0\\rangle+|1\\rangle)/\\sqrt{{2}}$, while CNOT creates non-local entanglement when applied to a superposition control wire."
        )

    return {
        "source": "Quantum Mind Pedagogical Engine",
        "language": lang_code,
        "reply": fallback_reply
    }
