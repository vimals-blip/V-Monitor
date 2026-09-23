FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/simulator/ ./apps/simulator/
RUN npm install -w apps/simulator
CMD ["npm", "run", "start", "-w", "apps/simulator"]
