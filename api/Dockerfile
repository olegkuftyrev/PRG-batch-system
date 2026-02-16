# PRG Batch System — API (AdonisJS)
# Build once api/ contains an Adonis app (Stage 0.1).
# Dev: ace serve --watch. Prod: node server.js or ace serve.

FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer cache)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy app (config, app/, start/, etc.)
COPY . .

# Build for production (output in build/)
RUN npm run build

EXPOSE 3333

# Run built server
CMD ["node", "build/bin/server.js"]
