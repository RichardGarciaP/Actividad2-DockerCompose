FROM node:25.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src src

EXPOSE 3000

CMD ["node", "src/server.js"]

