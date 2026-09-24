# Kubernetes Production Deployment

The architecture is horizontally scalable and stateless across Web, API, and AI services.
- Web: Deployment with 2+ replicas behind Ingress.
- API: Deployment with 3+ replicas connected to managed PostgreSQL and Redis cluster.
- AI Service: Deployment with 2+ replicas with Ollama sidecar or external Ollama service.
