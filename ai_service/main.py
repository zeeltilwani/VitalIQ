from fastapi import FastAPI, UploadFile, File
from groq import Groq
import os
import io
import json
import base64
from PIL import Image
from dotenv import load_dotenv

load_dotenv()
load_dotenv("../backend/.env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI()

client = None
if GROQ_API_KEY:
    print(f"🔑 Groq API Key detected: {GROQ_API_KEY[:10]}...")
    client = Groq(api_key=GROQ_API_KEY)
else:
    print("❌ ERROR: No GROQ_API_KEY found in .env")

PROMPT = """
Analyze this food image and return ONLY a JSON object:
{
  "label": "Food Name",
  "calories": 100,
  "confidence": 0.9,
  "alternatives": []
}
If not food, return {"error": "No food detected"}.
"""

@app.post("/predict")
async def predict_food(file: UploadFile = File(...)):
    print(f"\n📸 [AI] New request received: {file.filename}")
    try:
        if not client:
            return {"error": "GROQ_API_KEY not set"}

        contents = await file.read()
        print(f"📦 [AI] File size: {len(contents)} bytes")
        
        base64_image = base64.b64encode(contents).decode('utf-8')
        print("🤖 [AI] Calling Groq Llama-Vision...")

        # Using the newest Llama 4 Scout model
        completion = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                        },
                    ],
                }
            ],
            response_format={"type": "json_object"}
        )
        
        raw_content = completion.choices[0].message.content
        print(f"📝 [AI] Raw Response: {raw_content}")
        
        result = json.loads(raw_content)
        return result
        
    except Exception as e:
        print(f"🔥 [AI] Error: {e}")
        return {"error": str(e)}
