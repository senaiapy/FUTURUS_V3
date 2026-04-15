FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Increase npm timeout and retries to avoid ETIMEDOUT in Docker builds
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
