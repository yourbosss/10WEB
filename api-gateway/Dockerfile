FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN npx tsc

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/app.js"]
