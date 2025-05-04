FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci --only=production
RUN npm install -g ts-node typescript

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY src/scripts ./src/scripts

RUN npx prisma generate

ENV OPENSSL_CONF=/etc/ssl/openssl.cnf

EXPOSE 3000

CMD ["npm", "start"] 