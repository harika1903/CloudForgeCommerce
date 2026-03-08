FROM node:18-alpine

# force rebuild v2
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]