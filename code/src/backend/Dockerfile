FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN apk add --no-cache openssl ca-certificates
RUN npm cache clean --force
RUN npm config set strict-ssl false
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start development server
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
