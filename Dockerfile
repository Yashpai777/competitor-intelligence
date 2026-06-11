# =============================================================================
# Stage 1 — deps
# Install only the dependencies needed for packages/database and apps/api,
# skipping the apps/web workspace entirely.
# =============================================================================
FROM node:24-alpine AS deps

WORKDIR /app

# Copy root manifest and lockfile so npm workspaces can resolve the graph
COPY package.json package-lock.json* ./

# Copy only the workspace manifests that are needed for the API build.
# Omitting apps/web prevents its (large) dependency tree from being installed.
COPY packages/database/package.json ./packages/database/package.json
COPY apps/api/package.json           ./apps/api/package.json

# Install dependencies for the two relevant workspaces.
# --ignore-scripts avoids running lifecycle scripts (e.g. postinstall) at this
# stage; Prisma generate is run explicitly in the build stage instead.
RUN npm install --workspace=packages/database --workspace=apps/api \
      --ignore-scripts \
    && npm install --ignore-scripts

# =============================================================================
# Stage 2 — builder
# Generate the Prisma client and compile the NestJS application.
# =============================================================================
FROM node:24-alpine AS builder

WORKDIR /app

# Bring in installed node_modules from the deps stage
COPY --from=deps /app/node_modules       ./node_modules
COPY --from=deps /app/packages/database/node_modules \
                                          ./packages/database/node_modules
COPY --from=deps /app/apps/api/node_modules \
                                          ./apps/api/node_modules

# Copy source for the two workspaces that are part of the build
COPY packages/database/ ./packages/database/
COPY apps/api/          ./apps/api/

# Copy root package.json so npm workspace commands resolve correctly
COPY package.json ./

# Generate the Prisma client into node_modules/@prisma/client
RUN npx prisma generate \
      --schema=packages/database/prisma/schema.prisma

# Compile the NestJS app.  nest build reads apps/api/tsconfig.json and emits
# output to apps/api/dist/ (outDir: ./dist relative to apps/api/).
RUN npm run build --workspace=apps/api

# =============================================================================
# Stage 3 — runner
# Lean production image that contains only what is needed at runtime.
# =============================================================================
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install Playwright's system-level dependencies and the Chromium browser that
# the scraping module uses at runtime.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
    && ln -sf /usr/bin/chromium-browser /usr/bin/chromium

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

# Copy root manifest (needed for npx prisma to resolve correctly)
COPY package.json ./

# Copy workspace manifests
COPY packages/database/package.json ./packages/database/package.json
COPY apps/api/package.json           ./apps/api/package.json

# Copy node_modules (includes @prisma/client with generated bindings)
COPY --from=builder /app/node_modules       ./node_modules
COPY --from=builder /app/packages/database/node_modules \
                                             ./packages/database/node_modules
COPY --from=builder /app/apps/api/node_modules \
                                             ./apps/api/node_modules

# Copy the Prisma schema so migrate deploy can run at container start
COPY packages/database/prisma/ ./packages/database/prisma/

# Copy the compiled NestJS application — this is the critical artifact that
# Nixpacks was overwriting with raw source.
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3001

# Run migrations against the live database, then start the compiled app.
CMD ["sh", "-c", \
  "npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma && node apps/api/dist/main.js"]
