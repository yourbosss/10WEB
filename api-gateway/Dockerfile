# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и yarn.lock для установки зависимостей
COPY package*.json ./

RUN yarn install --frozen-lockfile

# Копируем конфигурацию TypeScript и исходники
COPY tsconfig.json ./
COPY src ./src

# Компилируем TypeScript в папку dist
RUN npx tsc

# Финальный образ
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и yarn.lock для установки продакшн-зависимостей
COPY package*.json ./

# Устанавливаем только продакшн-зависимости
RUN yarn install --production --frozen-lockfile

# Копируем скомпилированный код из билд-стейджа
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/app.js"]
