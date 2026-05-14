import random
import time
import requests
from datetime import datetime
import math

API_URL = "http://localhost:5000/api/sensor"
AI_PREDICT_URL = "http://localhost:8000/predict"

def get_or_create_worker():
    """Fetches an existing worker or creates a placeholder one to attach logs to."""
    try:
        workers_res = requests.get("http://localhost:5000/api/workers")
        workers = workers_res.json()
        if len(workers) > 0:
            return workers[-1]['_id']
        else:
            new_worker = requests.post("http://localhost:5000/api/workers", json={
                "name": "Alex Vance",
                "role": "Lead Miner",
                "contact": "555-0199"
            })
            return new_worker.json().get('_id')
    except Exception as e:
        print("Backend 500 or unreachable. Using mock Worker ID for simulation fallback.")
        return "WKR-ALPHA-01"

current_gas = 5.0
current_temp = 25.0
current_hr = 75
current_humidity = 40.0

def smooth_random_walk(current, min_val, max_val, max_step):
    """Generates a realistic smooth random walk value clamp within bounds."""
    step = random.uniform(-max_step, max_step)
    nxt = current + step
    
    if nxt > max_val: nxt = max_val - random.uniform(0, max_step)
    if nxt < min_val: nxt = min_val + random.uniform(0, max_step)
    return round(nxt, 2)

def generate_row(time_step):
    global current_gas, current_temp, current_hr, current_humidity
    
    # 5% chance of a sudden critical anomaly
    is_anomaly = random.random() < 0.05
    
    if is_anomaly:
        current_gas = round(random.uniform(30, 120), 2)
        current_temp = round(random.uniform(40, 60), 2)
        current_hr = int(random.uniform(120, 140))
        current_humidity = round(random.uniform(70, 90), 2)
        print("\n!!! TRIGGERING SIMULATED ANOMALY SPIKE !!!\n")
    else:
        # Smooth walk
        # Gas: 0-15 ppm normal walk
        current_gas = smooth_random_walk(current_gas, 0.0, 15.0, 1.5)
        # Temp: 18-35 C
        current_temp = smooth_random_walk(current_temp, 18.0, 35.0, 0.5)
        # HR: 60-100 bpm 
        current_hr = int(smooth_random_walk(current_hr, 60, 100, 3))
        # Humidity: 30-70%
        current_humidity = smooth_random_walk(current_humidity, 30.0, 70.0, 1.0)
        
    # Simulate a worker slowly moving through tunnels (changing coordinates slightly)
    lat_base = 34.0200
    lng_base = -118.1500
    # Walk in a circle 
    lat = lat_base + (math.sin(time_step / 10.0) * 0.005)
    lng = lng_base + (math.cos(time_step / 10.0) * 0.005)
    
    timestamp = datetime.now().isoformat()
    return {
        "timestamp": timestamp,
        "gasLevel": current_gas,
        "temperature": current_temp,
        "humidity": current_humidity,
        "heartRate": current_hr,
        "location": {"lat": round(lat, 6), "lng": round(lng, 6)}
    }

def simulate():
    worker_id = get_or_create_worker()
    if not worker_id:
        return

    print("Starting continuous live simulation. Sending data every 2 seconds...")
    time_step = 0
    
    while True:
        data = generate_row(time_step)
        time_step += 1
        
        # 1. Get detailed Prediction from AI Engine
        status = "SAFE"
        risk_score = 0
        explanation = "AI engine disconnected."
        
        try:
            ai_res = requests.post(AI_PREDICT_URL, json={
                "gasLevel": data["gasLevel"],
                "temperature": data["temperature"],
                "humidity": data["humidity"],
                "heartRate": data["heartRate"]
            })
            if ai_res.status_code == 200:
                engine_data = ai_res.json()
                status = engine_data.get("status", "SAFE")
                risk_score = engine_data.get("risk_score", 0)
                explanation = engine_data.get("explanation", "")
        except Exception:
            pass # Silent fail if AI engine is off, just means we use default
            
        # 2. Post to Node.js Backend
        payload = {
            **data, 
            "workerId": worker_id, 
            "status": status,
            "risk_score": risk_score,
            "explanation": explanation
        }
        
        try:
            requests.post(API_URL, json=payload)
            print(f"[{data['timestamp'][11:19]}] Sent -> Gas:{data['gasLevel']} HR:{data['heartRate']} Temp:{data['temperature']} -> [{status} ({risk_score}%)]")
        except Exception as e:
            print("Failed to send data to backend. Retrying...")
            
        time.sleep(2) # Send every 2 seconds for high-frequency dashboard updates

if __name__ == "__main__":
    simulate()

