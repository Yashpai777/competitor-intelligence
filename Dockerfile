# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Copy workspace manifests so npm can resolve the workspace graph
COPY package.json package-lock.json* ./
COPY packages/database/package.json ./packages/database/package.json
COPY apps/api/package.json           ./apps/api/package.json

# Install only the dependencies needed for the database package and the API
RUN npm install --workspace=packages/database --workspace=apps/api

# Copy source for the packages required at build time
COPY packages/database ./packages/database
COPY apps/api          ./apps/api

# Generate the Prisma client (required before compiling the NestJS app)
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Compile the NestJS application (outputs to apps/api/dist/)
RUN npm run build --workspace=apps/api

# ─── Runtime stage ───────────────────────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy workspace manifests
COPY package.json package-lock.json* ./
COPY packages/database/package.json ./packages/database/package.json
COPY apps/api/package.json           ./apps/api/package.json

# Install production dependencies only
RUN npm install --workspace=packages/database --workspace=apps/api --omit=dev

# Copy the Prisma schema and generated client from the build stage
COPY --from=builder /app/packages/database/prisma        ./packages/database/prisma
COPY --from=builder /app/node_modules/.prisma            ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma            ./node_modules/@prisma

# Copy the compiled NestJS application
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Install Playwright's Chromium browser and its OS dependencies
RUN npx playwright install chromium --with-deps

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
