FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and http-server
RUN npm ci && npm install -g http-server

# Copy source code
COPY . .

# Build Angular app
RUN npm run build

# Expose port 80
EXPOSE 80

# Start server to serve built files
CMD ["http-server", "dist/frontend", "-p", "80", "-c-1"]
