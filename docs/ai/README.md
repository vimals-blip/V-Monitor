# AI Operations & Root Cause Analysis Engine

FastAPI-powered autonomous NOC assistant implementing 19 tools.
- Provider-independent LLM connector (Ollama `llama3.1` or open weights).
- Distinguishes between `FACT` (verified telemetry), `INFERENCE` (probable cause), and `RECOMMENDATION` (operator actions).
- Statistical anomaly detection (Z-score analysis).
