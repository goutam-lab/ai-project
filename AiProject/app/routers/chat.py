from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from decouple import config
from openai import AsyncOpenAI, APIConnectionError, APIStatusError # <--- UPDATED IMPORT
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
    # CRITICAL FIX: Set the correct new model as the default
    model: Optional[str] = "openrouter/sherlock-dash-alpha" 

# Configuration - Updated for OpenRouter
OPENROUTER_API_KEY = config("OPENROUTER_API_KEY", default=None) # <--- New Key Name
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1" 
# Optional headers for OpenRouter policy compliance
OPENROUTER_REFERER = config("OPENROUTER_REFERER", default="http://localhost") 
OPENROUTER_TITLE = config("OPENROUTER_TITLE", default="MediCheck AI")

@router.post("/completions")
async def chat_completions(request: ChatRequest):
    """
    Endpoint to interact with OpenRouter AI for medical assistance.
    """
    # 1. Debugging: Check if key is loaded
    if not OPENROUTER_API_KEY:
        logger.error("OPENROUTER_API_KEY is not set in .env file.")
        raise HTTPException(status_code=500, detail="Server configuration error: API Key missing.")

    try:
        # 2. Prepare the system prompt (content remains the same)
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

        # 3. Construct the message history (logic remains the same)
        client_messages = [msg.dict() for msg in request.messages if msg.role != "system"]
        final_messages = [system_prompt] + client_messages

        # 4. Initialize OpenAI Client, configured for OpenRouter
        client = AsyncOpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=OPENROUTER_API_KEY,
            timeout=30.0 # Set request timeout
        )

        # 5. Call OpenRouter API asynchronously
        completion = await client.chat.completions.create(
            model=request.model,
            messages=final_messages,
            temperature=0.7,
            max_tokens=500,
            # Pass OpenRouter specific headers
            extra_headers={
                "HTTP-Referer": OPENROUTER_REFERER, 
                "X-Title": OPENROUTER_TITLE,
            },
            # Note: 'safe_prompt' is removed as it is Mistral-specific
        )

        # 6. Process response
        if not completion.choices:
            raise HTTPException(status_code=502, detail="Invalid response from AI provider (no choices)")

        bot_content = completion.choices[0].message.content
        
        return {"role": "assistant", "content": bot_content}

    # Handle Network/Connection Errors
    except APIConnectionError as e:
        logger.error(f"Network Error communicating with OpenRouter: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable: Could not connect to AI provider.")
    
    # Handle API Status Errors
    except APIStatusError as e:
        logger.error(f"OpenRouter API Error: {e.status_code} - {e.response.text}")
        status_code_to_return = e.status_code if isinstance(e.status_code, int) and e.status_code >= 400 else 500
        raise HTTPException(
            status_code=status_code_to_return, 
            detail=f"AI Provider Error: {e.status_code}"
        )
        
    # Handle all other exceptions
    except Exception as e:
        logger.error(f"Chat Endpoint Internal Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))