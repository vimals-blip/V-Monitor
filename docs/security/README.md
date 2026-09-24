# Security & Governance

- Strict server-side `organization_id` & `tenant_id` verification.
- Passwords hashed using bcrypt (10 rounds).
- Rate-limiting enabled on authentication routes.
- Allow-listed command execution only (no arbitrary shell injection).
- Immutable audit log capturing all mutations with actor email, IP address, and before/after states.
