import os

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3001/api/v1")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
AI_MODEL = os.getenv("AI_MODEL", "llama3.1")
JWT_SECRET = os.getenv("JWT_SECRET", "dev_jwt_secret_change_in_production_64chars")
PORT = int(os.getenv("PORT", "8100"))
