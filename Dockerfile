# Stage 1: Build the React app
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production environment
FROM node:20-slim

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist
# Copy the server file and any other necessary files
COPY --from=builder /app/server.ts ./
# Copy tsconfig if needed for tsx/ts-node, but for production we'll use node
# Actually, since we're using ES modules and node 20, we can run the server.ts directly with node if we use --loader ts-node/esm or similar, 
# but it's better to just use tsx for simplicity in this environment.
# Alternatively, we could transpile server.ts to server.js during build.
# Let's keep it simple and use tsx in the production image too, or just copy the whole source if it's small.
COPY --from=builder /app/package.json ./

# Expose the port the app runs on
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Command to run the application
# We'll use tsx to run the server.ts directly in production for simplicity
RUN npm install -g tsx
CMD ["tsx", "server.ts"]
