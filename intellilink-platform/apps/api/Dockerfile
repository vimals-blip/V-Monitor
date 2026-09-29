FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace files and package manifests
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install dependencies and build API
RUN npm install
RUN npm run build -w apps/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and built dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3001
CMD ["node", "apps/api/dist/main"]
