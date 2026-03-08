FROM node:18-alpine

# force rebuild v2
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002

CMD ["node", "src/server.js"]