from fastapi import APIRouter
from models.schemas import AnomalyDetectRequest, AnomalyDetectResponse
import numpy as np

router = APIRouter(prefix="/api/v1/anomaly", tags=["Anomaly"])

@router.post("/detect", response_model=AnomalyDetectResponse)
async def detect_anomalies(req: AnomalyDetectRequest):
    if len(req.metrics) < 3:
        return AnomalyDetectResponse(
            isAnomaly=False,
            score=0.0,
            baselineMean=0.0,
            baselineStd=0.0,
            anomalousPoints=[]
        )
    arr = np.array(req.metrics)
    mean = float(np.mean(arr))
    std = float(np.std(arr)) if np.std(arr) > 0 else 0.001
    
    z_scores = np.abs((arr - mean) / std)
    anomalous_indices = [int(i) for i, z in enumerate(z_scores) if z > req.thresholdStdDev]
    
    return AnomalyDetectResponse(
        isAnomaly=len(anomalous_indices) > 0,
        score=float(np.max(z_scores)) if len(z_scores) > 0 else 0.0,
        baselineMean=mean,
        baselineStd=std,
        anomalousPoints=anomalous_indices
    )
