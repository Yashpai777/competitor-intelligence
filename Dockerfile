FROM node:24 AS deps

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY turbo.json ./

# Copy only what we need (skip web app entirely)
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install ALL deps including devDeps (needed for nest build)
RUN npm install --include=dev

FROM node:24 AS builder

WORKDIR /app

COPY --from=deps /app ./

# Generate Prisma client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build the NestJS API
RUN cd apps/api && npx nest build

FROM node:24 AS runner

WORKDIR /app

COPY --from=builder /app ./

# Expose port
EXPOSE 3001

# Run migrations then start
CMD npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma && node apps/api/dist/main.js
