FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app

COPY tsconfig.json tsconfig.jest.json jest.config.cjs prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
COPY scripts ./scripts
RUN npm run build

FROM node:20-bookworm-slim AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/assets ./src/assets
COPY package.json ./

RUN mkdir -p /app/storages/projects && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/src/app.js"]
