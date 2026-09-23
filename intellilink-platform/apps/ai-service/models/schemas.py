from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    tenantId: Optional[str] = None
    role: Optional[str] = "NOC_OPERATOR"

class EvidenceItem(BaseModel):
    type: str # FACT, INFERENCE, RECOMMENDATION
    description: str
    sourceType: str
    sourceId: str
    timestamp: Optional[str] = None

class RcaRequest(BaseModel):
    targetId: str
    targetType: str # SITE, GATEWAY, POP, WAN
    tenantId: Optional[str] = None

class RcaResponse(BaseModel):
    summary: str
    likelyCause: str
    confidence: float
    affectedComponents: List[str]
    evidence: List[EvidenceItem]
    recommendedAction: str
    risk: str

class AnomalyDetectRequest(BaseModel):
    sourceId: str
    metrics: List[float]
    thresholdStdDev: float = 2.0

class AnomalyDetectResponse(BaseModel):
    isAnomaly: bool
    score: float
    baselineMean: float
    baselineStd: float
    anomalousPoints: List[int]
