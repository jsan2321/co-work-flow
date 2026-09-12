# Stage 1: Base image
FROM node:24-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY apps/api/package*.json ./apps/api/
RUN npm ci

# Stage 2: Development
FROM base AS dev
WORKDIR /app
COPY . .
RUN npx prisma generate --schema=apps/api/src/prisma/schema.prisma
EXPOSE 4000
CMD ["npm", "run", "dev", "--workspace=@coworkflow/api"]

# Stage 3: Builder
FROM base AS builder
WORKDIR /app
COPY . .
RUN npm run build --workspace=@coworkflow/types
RUN npx prisma generate --schema=apps/api/src/prisma/schema.prisma
RUN npm run build --workspace=@coworkflow/api

# Stage 4: Production Runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/types/package*.json ./packages/types/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/api/src/prisma ./apps/api/src/prisma

EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
