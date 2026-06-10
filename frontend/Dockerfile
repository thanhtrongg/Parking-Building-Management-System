# --- Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy ONLY package files first for better Docker layer caching
COPY package*.json ./

# Let the container build its own Alpine-compatible node_modules
RUN npm install

# Copy the rest of the source code
COPY . .

# Set the build argument for the backend API connection
ARG VITE_API_URL=http://localhost:8080/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Build the production static files
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# Copy compiled files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
