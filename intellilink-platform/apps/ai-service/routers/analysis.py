from fastapi import APIRouter
from models.schemas import RcaRequest, RcaResponse
from services.rca_engine import rca_engine

router = APIRouter(prefix="/api/v1/analysis", tags=["Analysis"])

@router.post("/rca", response_model=RcaResponse)
async def analyze_root_cause(req: RcaRequest):
    return await rca_engine.analyze(req)
