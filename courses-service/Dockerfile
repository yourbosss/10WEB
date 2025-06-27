FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN yarn install --frozen-lockfile --production=false

COPY tsconfig.json ./
COPY src ./src

EXPOSE 5000

CMD ["node", "dist/app.js"]
