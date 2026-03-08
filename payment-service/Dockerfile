FROM node:18-alpine

# force rebuild v2
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["node", "src/worker.js"]