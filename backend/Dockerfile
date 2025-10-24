FROM node:25.0-alpine

WORKDIR /app

COPY package.json package-lock.json .env ./
RUN npm ci

COPY src src

EXPOSE 5000
RUN pwd

CMD ["node", "src/server.js"]