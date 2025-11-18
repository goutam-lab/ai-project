from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from decouple import config  # <--- CHANGED: Uses your project's config loader
import httpx
import logging

# Initialize router
router = APIRouter(
    prefix="/chat",
    tags=["AI Chatbot"],
    responses={404: {"description": "Not found"}},
)

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Data Models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = "mistral-small-latest" 

# Configuration
# We use config(default=None) to prevent crashing if key is missing, 
# allowing us to return a proper HTTP error instead.
MISTRAL_API_KEY = config("MISTRAL_API_KEY", default=None)
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

@router.post("/completions")
async def chat_completions(request: ChatRequest):
    """
    Endpoint to interact with Mistral AI for medical assistance.
    """
    # 1. Debugging: Check if key is loaded
    if not MISTRAL_API_KEY:
        logger.error("MISTRAL_API_KEY is not set in .env file.")
        raise HTTPException(status_code=500, detail="Server configuration error: API Key missing.")

    try:
        # 2. Prepare the system prompt
        system_prompt = {
            "role": "system",
            "content": (
                "You are 'MediCheck AI', an expert virtual assistant for a Medicine Monitoring System. "
                "Your goal is to assist users with: "
                "1. Identifying potential counterfeit medicines (ask for batch numbers, packaging details, spelling). "
                "2. Explaining common side effects and uses of medications. "
                "3. Navigating the MediCheck platform. "
                "IMPORTANT SAFETY GUARDRAILS: "
                "- clearly state you are an AI and NOT a doctor. "
                "- Always advise users to consult a certified medical professional for health advice or emergencies. "
                "- Do not provide specific medical diagnoses or prescriptions. "
                "- Be concise, professional, and empathetic."
            )
        }

        # 3. Construct the message history
        client_messages = [msg.dict() for msg in request.messages if msg.role != "system"]
        final_messages = [system_prompt] + client_messages

        # 4. Payload for Mistral
        payload = {
            "model": request.model,
            "messages": final_messages,
            "temperature": 0.7,
            "max_tokens": 500,
            "safe_prompt": True 
        }

        headers = {
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        # 5. Call Mistral API asynchronously
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(MISTRAL_API_URL, json=payload, headers=headers)
            
            if response.status_code != 200:
                error_detail = response.text
                logger.error(f"Mistral API Error: {error_detail}")
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"AI Provider Error: {response.status_code}"
                )

            data = response.json()
            
            if "choices" not in data or not data["choices"]:
                 raise HTTPException(status_code=502, detail="Invalid response from AI provider")

            bot_content = data["choices"][0]["message"]["content"]
            
            return {"role": "assistant", "content": bot_content}

    except httpx.RequestError as e:
        logger.error(f"Network Error communicating with Mistral: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable: Could not connect to AI provider.")
    except Exception as e:
        logger.error(f"Chat Endpoint Internal Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))