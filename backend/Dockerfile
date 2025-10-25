FROM node:25.0-alpine

WORKDIR /app

COPY package.json package-lock.json .env ./
RUN npm ci

COPY src src

EXPOSE 3000
RUN pwd

CMD ["node", "src/server.js"]