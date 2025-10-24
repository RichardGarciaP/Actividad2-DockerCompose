FROM node:25.0-alpine AS builder

WORKDIR /app
COPY . .

RUN npm ci
RUN npx vite build


FROM nginx:1.29.1-alpine-slim

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .
EXPOSE 80