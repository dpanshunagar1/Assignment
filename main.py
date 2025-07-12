from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import re
from typing import Dict, List

app = FastAPI(title="Emotion Reflection API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

class EmotionResponse(BaseModel):
    emotion: str
    confidence: float

# Mock emotion analysis using keyword matching
EMOTION_KEYWORDS = {
    "Happy": ["happy", "joy", "excited", "great", "wonderful", "amazing", "fantastic", "delighted", "cheerful", "elated"],
    "Sad": ["sad", "depressed", "down", "upset", "disappointed", "heartbroken", "melancholy", "gloomy", "sorrowful"],
    "Anxious": ["nervous", "worried", "anxious", "stressed", "afraid", "scared", "panic", "overwhelmed", "tense", "uneasy"],
    "Angry": ["angry", "mad", "furious", "irritated", "annoyed", "frustrated", "rage", "outraged", "livid"],
    "Excited": ["excited", "thrilled", "enthusiastic", "eager", "pumped", "energized", "motivated", "inspired"],
    "Calm": ["calm", "peaceful", "relaxed", "serene", "tranquil", "content", "composed", "zen", "balanced"],
    "Confused": ["confused", "puzzled", "uncertain", "lost", "bewildered", "perplexed", "unclear", "mixed"],
    "Confident": ["confident", "sure", "determined", "strong", "capable", "ready", "prepared", "positive", "optimistic"]
}

def analyze_emotion(text: str) -> Dict[str, float]:
    """
    Mock emotion analysis based on keyword matching.
    Returns a dictionary with emotion scores.
    """
    text_lower = text.lower()
    emotion_scores = {}
    
    for emotion, keywords in EMOTION_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            # Count keyword occurrences with word boundaries
            matches = len(re.findall(r'\b' + re.escape(keyword) + r'\b', text_lower))
            score += matches
        
        # Normalize score and add some randomness for variety
        if score > 0:
            emotion_scores[emotion] = min(score / len(keywords) + random.uniform(0.1, 0.3), 1.0)
        else:
            emotion_scores[emotion] = random.uniform(0.0, 0.2)
    
    return emotion_scores

def get_dominant_emotion(emotion_scores: Dict[str, float]) -> tuple:
    """
    Returns the emotion with highest score and its confidence level.
    """
    if not emotion_scores:
        return "Neutral", 0.5
    
    dominant_emotion = max(emotion_scores, key=emotion_scores.get)
    confidence = emotion_scores[dominant_emotion]
    
    # Ensure minimum confidence for better user experience
    if confidence < 0.3:
        confidence = random.uniform(0.3, 0.7)
    
    return dominant_emotion, round(confidence, 2)

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Emotion Reflection API is running", "status": "healthy"}

@app.post("/analyze-emotion", response_model=EmotionResponse)
async def analyze_emotion_endpoint(input_data: TextInput):
    """
    Analyze emotion from input text and return mock analysis.
    """
    try:
        if not input_data.text or not input_data.text.strip():
            raise HTTPException(status_code=400, detail="Text input cannot be empty")
        
        if len(input_data.text) > 1000:
            raise HTTPException(status_code=400, detail="Text input too long (max 1000 characters)")
        
        # Perform mock emotion analysis
        emotion_scores = analyze_emotion(input_data.text)
        dominant_emotion, confidence = get_dominant_emotion(emotion_scores)
        
        return EmotionResponse(
            emotion=dominant_emotion,
            confidence=confidence
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing emotion: {str(e)}")

@app.get("/emotions")
async def get_available_emotions():
    """
    Get list of available emotions that can be detected.
    """
    return {
        "emotions": list(EMOTION_KEYWORDS.keys()),
        "total_count": len(EMOTION_KEYWORDS)
    }

