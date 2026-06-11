FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY turbo.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all deps including devDeps
RUN npm install --include=dev

# Generate Prisma client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build database package first (compile TS -> JS so Node can require it)
RUN cd packages/database && npx tsc

# Build NestJS API
RUN cd apps/api && npx nest build

# Verify dist was created
RUN ls apps/api/dist/main.js

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma && node apps/api/dist/main.js"]
