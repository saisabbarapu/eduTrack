from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any

from delay_predict import predict_delay
from duplicate_detect import check_duplicate
from performance_risk import performance_risk

app = FastAPI(title="EduTrack ML Service")

@app.get("/")
def root_endpoint():
    return {
        "status": "ok",
        "service": "EduTrack ML Microservice",
        "endpoints": {
            "docs": "/docs",
            "duplicate": "/duplicate",
            "delay": "/delay",
            "performance": "/performance"
        }
    }

@app.get("/health")
def health_endpoint():
    return {"status": "ok"}

class MLRequest(BaseModel):
    data: Dict[str, Any]

@app.post("/delay")
def delay_endpoint(req: MLRequest):
    return predict_delay(req.data)

@app.post("/duplicate")
def duplicate_endpoint(req: MLRequest):
    return check_duplicate(req.data)

@app.post("/performance")
def performance_endpoint(req: MLRequest):
    return performance_risk(req.data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
