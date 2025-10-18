# Use Node.js 18 Alpine as base image for smaller size
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Note: Due to npm exit handler bug in Docker, running install twice as workaround
RUN npm install --omit=dev || true
RUN npm install --omit=dev

# Copy application files
COPY . ./

# Expose port 3000
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production

# Run the application
CMD ["node", "main.js"]
