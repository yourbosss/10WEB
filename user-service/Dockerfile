FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Устанавливаем все зависимости, включая dev
RUN yarn install --frozen-lockfile --production=false

COPY tsconfig.json ./
COPY src ./src

RUN npx tsc

# Финальный образ
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install --production --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/app.js"]
