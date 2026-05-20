FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY tsconfig.json ./
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY package*.json ./
RUN npm ci --only=production \
  && npm install ts-node typescript --no-save

COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts
COPY --from=builder /app/prisma/tsconfig.json ./prisma/tsconfig.json

COPY scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN chmod +x scripts/docker-entrypoint.sh

EXPOSE 3000

CMD ["sh", "scripts/docker-entrypoint.sh"]
