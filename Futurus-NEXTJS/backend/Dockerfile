FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Increase npm timeout and retries to avoid ETIMEDOUT in Docker builds
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build

# Create upload directories for file storage
RUN mkdir -p /app/uploads/markets /app/uploads/images /app/uploads/verify /app/uploads/support /app/uploads/documents /app/uploads/blogs

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
