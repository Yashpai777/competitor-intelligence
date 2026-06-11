FROM node:20-alpine

RUN apk add --no-cache python3 make g++ openssl openssl-dev

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

# Verify database compiled
RUN test -f packages/database/dist/index.js && echo "DB DIST OK" || (echo "DB DIST MISSING" && exit 1)

# Force-create the workspace symlink (in case npm workspaces skipped it)
RUN mkdir -p node_modules/@ci && ln -sfn /app/packages/database /app/node_modules/@ci/database

# Compile API using tsconfig.build.json (no path aliases -> uses node_modules resolution)
RUN cd apps/api && npx tsc -p tsconfig.build.json --skipLibCheck

# Verify dist exists - show full tree on failure
RUN test -f apps/api/dist/main.js && echo "BUILD OK" || (echo "DIST MISSING - tree:" && find apps/api/dist -type f 2>/dev/null | head -30 && exit 1)

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma && node apps/api/dist/main.js"]
