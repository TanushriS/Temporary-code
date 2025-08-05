import pandas as pd
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os
from typing import Optional

from train_model import train_and_save
from gemini_advisor import get_gemini_advice
from sensor_reader import SensorReader
from advisory_history import AdvisoryHistory

app = FastAPI(title="ThermoSense ML + Gemini Advisory")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "model.pkl"
ENCODER_PATH = "encoder.pkl"
COLUMN_PATH = "columns.pkl"

# Initialize components
sensor_reader = SensorReader()
advisory_history = AdvisoryHistory()

# Check if model, encoder, and column list exist
if not (os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH) and os.path.exists(COLUMN_PATH)):
    print("Model, encoder, or column file not found. Training...")
    train_and_save()

# Load model and encoder
model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)
print("Model and encoder loaded.")


# ========== Pydantic Models ==========
class SensorInput(BaseModel):
    battery_temp: float
    ambient_temp: float
    device_state: str
    battery_level: Optional[int] = 75
    cpu_temp: Optional[float] = None


# ========== Helper Functions ==========
def get_alert_level(impact):
    if impact > 0.07:
        return "danger"
    elif impact > 0.04:
        return "warning"
    else:
        return "safe"


# ========== API Endpoints ==========
@app.get("/")
def home():
    return {"message": "Welcome to ThermoSense Advisory API with Gemini AI"}


@app.get("/api/sensors")
async def get_sensor_data():
    """Get real-time sensor data from the system"""
    try:
        battery_info = sensor_reader.get_battery_info()
        temp_info = sensor_reader.get_temperature_info()
        system_info = sensor_reader.get_system_info()
        
        return {
            "battery": battery_info,
            "temperature": temp_info,
            "system": system_info,
            "timestamp": pd.Timestamp.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/advice")
async def get_advice(input: SensorInput):
    try:
        # Get ML model prediction
        columns = joblib.load(COLUMN_PATH)
        
        input_df = pd.DataFrame([{
            "battery_temp": input.battery_temp,
            "ambient_temp": input.ambient_temp,
            "device_state": input.device_state
        }])
        
        encoded_state = encoder.transform(input_df[["device_state"]])
        encoded_df = pd.DataFrame(encoded_state, columns=encoder.get_feature_names_out(["device_state"]))
        X_live = pd.concat([input_df[["battery_temp", "ambient_temp"]].reset_index(drop=True), encoded_df], axis=1)
        X_live = X_live.reindex(columns=columns, fill_value=0)
        
        impact = model.predict(X_live)[0]
        
        # Get Gemini advice
        gemini_response = get_gemini_advice(
            battery_temp=input.battery_temp,
            ambient_temp=input.ambient_temp,
            device_state=input.device_state,
            battery_level=input.battery_level,
            cpu_temp=input.cpu_temp
        )
        
        # Combine ML prediction with Gemini advice
        response = {
            "predicted_health_impact": round(float(impact), 5),
            "alert_level": gemini_response["alert_level"],
            "natural_language_tip": gemini_response["natural_language_tip"],
            "optional_action": gemini_response["optional_action"],
        }
        
        # Save to history
        history_entry = {
            **input.dict(),
            **response
        }
        await advisory_history.add_advisory(history_entry)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/advice/history")
async def get_advisory_history(limit: int = 50):
    """Get advisory history"""
    try:
        history = await advisory_history.get_history(limit=limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/advice/statistics")
async def get_advisory_statistics():
    """Get advisory statistics"""
    try:
        stats = await advisory_history.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))