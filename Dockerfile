FROM node:20-alpine AS builder

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files and install dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source and build (will use devDependencies)
COPY . .
RUN npm run build

# Final, minimal runtime image
FROM node:20-alpine AS runtime
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --production

# Copy dist (built app) and any server files needed to run
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
# Use Node 20 Alpine
FROM node:20-alpine

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
