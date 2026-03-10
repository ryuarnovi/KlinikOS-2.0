# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files dari root frontend/
COPY package*.json ./
RUN npm install

# Copy semua source (next.config.ts, app/, public/, tsconfig.json, dll)
COPY . .

# Set env untuk build
ENV NEXT_PUBLIC_API_URL=http://localhost:9090/api

RUN npm run build

# Final stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:9090/api

CMD ["npm", "start"]
