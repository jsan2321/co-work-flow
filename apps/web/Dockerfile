# Stage 1: Base image
FROM node:24-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY apps/web/package*.json ./apps/web/
RUN npm ci

# Stage 2: Development
FROM base AS dev
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace=@coworkflow/web"]

# Stage 3: Builder
FROM base AS builder
WORKDIR /app
COPY . .
RUN npm run build --workspace=@coworkflow/types
RUN npm run build --workspace=@coworkflow/web

# Stage 4: Production Runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/types/package*.json ./packages/types/
COPY --from=builder /app/apps/web/package*.json ./apps/web/
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=@coworkflow/web"]
