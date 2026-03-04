# Build context must be repo root (so package-lock.json is available).
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps ./apps
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json ./
COPY . .
# Build from api package dir so dist is at apps/api/dist
WORKDIR /app/apps/api
RUN npx nest build

FROM base AS runner
ENV NODE_ENV=production
# Cloud Run sets PORT=8080; app uses process.env.PORT
ENV PORT=8080
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/drizzle ./drizzle
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./package.json
WORKDIR /app
EXPOSE 8080
USER node
CMD ["node", "dist/main.js"]
