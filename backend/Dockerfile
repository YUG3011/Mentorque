FROM node:20-alpine

WORKDIR /app

# Force Prisma to use binary engine in containerized environments
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

# Install OpenSSL — required by Prisma's query engine on Alpine (musl)
RUN apk add --no-cache openssl openssl-dev

# Install Node dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Generate Prisma client (must run AFTER openssl is installed)
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Expose port
EXPOSE 5000

# Push schema and start server (seed is run manually when needed)
CMD ["sh", "-c", "npx prisma db push --schema=src/prisma/schema.prisma && node src/server.js"]
