# Dockerfile for Node.js Backend
FROM node:18-slim

WORKDIR /app

# Install dependencies for building
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock* package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start"]
