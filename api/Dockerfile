# PRG Batch System — API (AdonisJS)
# Build once api/ contains an Adonis app (Stage 0.1).
# Dev: ace serve --watch. Prod: node server.js or ace serve.

FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer cache)
COPY package.json package-lock.json* ./
RUN npm install

# Copy app (config, app/, start/, etc.)
COPY . .

# Build for production (output in build/)
RUN npm run build -- --ignore-ts-errors

# Copy and prepare startup script
COPY scripts/start.sh ./scripts/
RUN chmod +x ./scripts/start.sh

EXPOSE 3333

# Run startup script (migrations + server)
CMD ["./scripts/start.sh"]
