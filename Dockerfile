FROM node:20-bookworm-slim AS frontend-deps
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM frontend-deps AS frontend-build
WORKDIR /frontend

COPY frontend/ ./
RUN npm run build

FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app

COPY tsconfig.json tsconfig.jest.json jest.config.cjs prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN npm run build
COPY --from=frontend-build /frontend/dist/ ./dist/src/public

FROM node:20-bookworm-slim AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src/assets ./src/assets
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY package.json ./

RUN mkdir -p /app/storages/projects /app/storages/private && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/app.js"]
