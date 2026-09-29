FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code, nest-cli config, and TypeScript config
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY src/ ./src/

# Compile NestJS production build
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 3001
CMD ["node", "dist/main"]
