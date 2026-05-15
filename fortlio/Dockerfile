# ---- Base Builder Stage ----
FROM oven/bun:alpine AS builder
WORKDIR /app
# Copy only dependency files first (better caching)
COPY myfortlio/package.json myfortlio/bun.lock ./
# Install all deps (including dev for build)
RUN bun install
# Copy source
COPY myfortlio/ .
# Build the app
RUN bun run build


# ---- Production Runtime Stage ----
FROM oven/bun:alpine AS runtime
WORKDIR /app
# Copy only what's needed to run
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/dist ./dist
# Install only production deps
RUN bun install --production
# Expose port
EXPOSE 4010
# ENV BUN_ENV=dev
# Start app
CMD ["bun", "dist/server.js"]