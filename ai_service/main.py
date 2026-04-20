from fastapi import FastAPI, UploadFile, File
import torch
import torchvision.models as models
from PIL import Image
import io
import requests

app = FastAPI()

print("Loading MobileNetV3 Small (Fast inference)...")
# Load model statically at startup
weights = models.MobileNet_V3_Small_Weights.DEFAULT
model = models.mobilenet_v3_small(weights=weights)
model.eval()

# Image transformation steps
preprocess = weights.transforms()

# Load generic ImageNet classes safely
imagenet_classes = ["unknown"] * 1000
try:
    response = requests.get("https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt", timeout=2)
    imagenet_classes = response.text.split("\n")
except Exception as e:
    print(f"Failed to fetch classes remotely, continuing with unknowns: {e}")

# Phase 2: Mappings and Caloric Dictionary
FOOD_MAP = {
    "pizza": {"label": "Pizza", "calories": 266},
    "burger": {"label": "Burger", "calories": 354},
    "pancake": {"label": "Dosa", "calories": 168},
    "crepe": {"label": "Dosa", "calories": 168},
    "rice": {"label": "Plain Rice", "calories": 130},
    "bread": {"label": "Roti", "calories": 100},
    "dough": {"label": "Idli", "calories": 58},
    "potpie": {"label": "Samosa", "calories": 260},
    "consomme": {"label": "Dal", "calories": 150},
    "apple": {"label": "Apple", "calories": 95},
    "banana": {"label": "Banana", "calories": 105},
}

def map_label(generic_label: str):
    gl_lower = generic_label.lower()
    for key, data in FOOD_MAP.items():
        if key in gl_lower:
            return data
    # Fallback for unmapped foods
    return {"label": generic_label.split(',')[0].title(), "calories": 100}

@app.get("/")
def read_root():
    return {"message": "VitalIQ Fast Food AI Service is running"}

@app.post("/predict")
async def predict_food(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Preprocess
        input_tensor = preprocess(image)
        input_batch = input_tensor.unsqueeze(0)
        
        # Predict (Non-blocking ML execution is natively fast for MobileNet)
        with torch.no_grad():
            output = model(input_batch)
        
        # Probabilities
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        # Top 3 Predictions
        top3_prob, top3_catid = torch.topk(probabilities, 3)
        
        predictions = []
        for i in range(top3_prob.size(0)):
            cat_id = top3_catid[i].item()
            score = top3_prob[i].item()
            raw_label = imagenet_classes[cat_id] if cat_id < len(imagenet_classes) else "unknown"
            mapped = map_label(raw_label)
            predictions.append({
                "raw_label": raw_label,
                "label": mapped["label"],
                "calories": mapped["calories"],
                "confidence": score
            })
            
        print("Raw model output (Top 3):", [(p["raw_label"], format(p["confidence"], ".3f")) for p in predictions])
        
        best = predictions[0]
        
        # We ensure alternative lists are unique and don't match the best label exactly by accident
        alts = []
        for p in predictions[1:]:
            if p["label"] not in alts and p["label"] != best["label"]:
                alts.append(p["label"])
        
        # Phase 4 Response formatting
        final_response = {
            "label": best["label"],
            "calories": best["calories"],
            "confidence": round(best["confidence"], 3),
            "alternatives": alts[:2] # Top 2 alternatives
        }
        
        print(f"Final mapped label: {best['label']} | Response Payload: {final_response}")
        return final_response
        
    except Exception as e:
        print(f"Error during prediction: {e}")
        return {"error": str(e)}
