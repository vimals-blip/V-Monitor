export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    type: process.env.DATABASE_TYPE || 'mysql',
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    name: process.env.DATABASE_NAME || 'intellilink_db',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'root',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_jwt_key_64_chars_min_length_for_hmac_sha256_prod',
    expiresIn: process.env.JWT_EXPIRATION || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_key_64_chars_min_length_prod',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8100',
  },
  telemetry: {
    secret: process.env.TELEMETRY_SECRET || 'dev_telemetry_secret',
  },
  simulator: {
    enabled: process.env.SIMULATOR_ENABLED === 'true',
  },
});
