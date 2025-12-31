# Client Production Dockerfile
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build client
RUN yarn build

# Production stage - use nginx for static files
FROM nginx:alpine AS runner

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Railway will map to $PORT)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
