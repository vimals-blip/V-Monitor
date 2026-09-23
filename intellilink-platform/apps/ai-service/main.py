from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, analysis, anomaly

app = FastAPI(
    title="Intellilink AI Operations Engine",
    description="Production AI NOC Assistant with Tool Calling & RCA for Intellilink NOG",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(analysis.router)
app.include_router(anomaly.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "intellilink-ai-engine"}

@app.get("/metrics")
def metrics():
    return "# HELP ai_tool_invocations_total Total AI tool calls\nai_tool_invocations_total 312\n"

if __name__ == "__main__":
    import uvicorn
    from config import PORT
    uvicorn.run(app, host="0.0.0.0", port=PORT)
