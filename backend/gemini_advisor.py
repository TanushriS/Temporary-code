import os
import google.generativeai as genai
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def get_gemini_advice(battery_temp: float, ambient_temp: float, device_state: str, 
                     battery_level: int = 75, cpu_temp: float = None) -> dict:
    """
    Get advice from Gemini AI based on device conditions
    """
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        # Create a comprehensive prompt
        prompt = f"""You are a battery health and device temperature expert. Analyze the following device conditions and provide advice:

Device State: {device_state}
Battery Temperature: {battery_temp}°C
Ambient Temperature: {ambient_temp}°C
Battery Level: {battery_level}%
CPU Temperature: {cpu_temp}°C if cpu_temp else "Not available"

Provide:
1. A brief assessment of the current thermal situation
2. Specific recommendations to protect battery health
3. Any immediate actions if temperatures are critical

Keep the response concise and practical. Focus on actionable advice."""

        response = model.generate_content(prompt)
        
        # Parse the response and determine alert level
        advice_text = response.text
        
        # Determine alert level based on temperatures
        if battery_temp > 45 or (cpu_temp and cpu_temp > 85):
            alert_level = "danger"
            optional_action = "Immediate cooling required - shut down intensive tasks"
        elif battery_temp > 38 or (cpu_temp and cpu_temp > 70):
            alert_level = "warning"
            optional_action = "Monitor temperature and reduce workload"
        else:
            alert_level = "safe"
            optional_action = None
        
        # Calculate a simple health impact score
        impact_score = 0.0
        if battery_temp > 25:
            impact_score += (battery_temp - 25) * 0.003
        if device_state == "charging" and battery_temp > 30:
            impact_score += 0.02
        if cpu_temp and cpu_temp > 60:
            impact_score += (cpu_temp - 60) * 0.001
            
        return {
            "natural_language_tip": advice_text,
            "alert_level": alert_level,
            "optional_action": optional_action,
            "predicted_health_impact": min(impact_score, 0.15)  # Cap at 0.15
        }
        
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        
        # Fallback advice
        if battery_temp > 40:
            return {
                "natural_language_tip": "⚠️ High battery temperature detected. Please close intensive applications and allow your device to cool down. Avoid charging until temperature normalizes.",
                "alert_level": "danger",
                "optional_action": "Stop charging and close heavy applications",
                "predicted_health_impact": 0.1
            }
        else:
            return {
                "natural_language_tip": "✅ Your device temperature is within normal range. Continue regular usage while monitoring for any changes.",
                "alert_level": "safe",
                "optional_action": None,
                "predicted_health_impact": 0.02
            }