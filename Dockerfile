FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all deps including devDeps
RUN npm install --include=dev

# Generate Prisma client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build database package -> JS
RUN cd packages/database && npx tsc

# Compile API with tsc directly (bypasses nest build)
RUN cd apps/api && npx tsc -p tsconfig.json --skipLibCheck

# Verify dist exists
RUN test -f apps/api/dist/main.js && echo "BUILD OK" || (echo "DIST MISSING - listing:" && ls -la apps/api/ && exit 1)

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma && node apps/api/dist/main.js"]
