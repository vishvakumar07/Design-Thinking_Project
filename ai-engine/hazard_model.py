import numpy as np
from sklearn.ensemble import IsolationForest

np.random.seed(42)
normal_data = np.column_stack((
    np.random.uniform(0, 5, 1000),
    np.random.uniform(20, 35, 1000),
    np.random.uniform(30, 60, 1000),
    np.random.uniform(60, 100, 1000)
))

model = IsolationForest(contamination=0.05, random_state=42)
model.fit(normal_data)

def predict_status(gas, temp, humidity, hr):
    risk_score = 0
    explanations = []

    if gas > 50:
        risk_score += 60
        explanations.append(f"CRITICAL gas level ({gas} ppm) detected.")
    elif gas > 20:
        risk_score += 30
        explanations.append(f"Elevated gas level ({gas} ppm).")
    elif gas > 7:
        risk_score += 15
        explanations.append("Slightly elevated gas concentration.")

    if temp > 45:
        risk_score += 50
        explanations.append(f"CRITICAL ambient temperature ({temp}°C).")
    elif temp > 40:
        risk_score += 25
        explanations.append(f"High ambient temperature ({temp}°C).")

    if hr > 130 or hr < 40:
        risk_score += 50
        explanations.append(f"CRITICAL worker heart rate ({hr} bpm).")
    elif hr > 110 or hr < 50:
        risk_score += 25
        explanations.append(f"Abnormal worker heart rate ({hr} bpm).")

    if humidity > 85:
        risk_score += 10
        explanations.append("High humidity environments.")

    features = np.array([[gas, temp, humidity, hr]])
    prediction = model.predict(features)
    
    if prediction[0] == -1 and risk_score < 40:
        risk_score += 30
        explanations.append("AI anomaly detector predicts unusual sensor combinations.")

    risk_score = min(max(int(risk_score), 0), 100)

    if risk_score >= 70:
        status = "CRITICAL"
    elif risk_score >= 40:
        status = "WARNING"
    else:
        status = "SAFE"
        if len(explanations) == 0:
            explanations.append("All systems normal.")
            risk_score = np.random.randint(0, 15)
            
    explanation_text = " ".join(explanations)

    return {
        "status": status,
        "risk_score": risk_score,
        "explanation": explanation_text
    }
