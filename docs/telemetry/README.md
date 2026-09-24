# Telemetry Ingestion & Real-Time Pipeline

Edge Gateways and PoPs stream heartbeats and metrics to:
- `POST /api/v1/telemetry/v1/gateway/heartbeat`
- `POST /api/v1/telemetry/v1/:sourceType/metrics`

High-concurrency time-series metrics are stored in `metric_samples` and immediately published over Socket.IO to connected NOC dashboards.
