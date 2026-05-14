from fastapi import FastAPI
from pydantic import BaseModel
from hazard_model import predict_status
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Mine Safety AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SensorDataInput(BaseModel):
    gasLevel: float
    temperature: float
    humidity: float
    heartRate: float

@app.post("/predict")
def predict(data: SensorDataInput):
    result = predict_status(data.gasLevel, data.temperature, data.humidity, data.heartRate)
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
