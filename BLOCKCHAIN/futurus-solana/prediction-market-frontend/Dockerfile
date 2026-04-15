# Dockerfile for Next.js Frontend
FROM node:20-slim AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:8082
ARG NEXT_PUBLIC_FUTANA_RPC_URL=https://api.devnet.solana.com
ARG NEXT_PUBLIC_FUT_MINT=FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FUTANA_RPC_URL=$NEXT_PUBLIC_FUTANA_RPC_URL
ENV NEXT_PUBLIC_FUT_MINT=$NEXT_PUBLIC_FUT_MINT

COPY package.json yarn.lock* package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tailwind.config.ts ./
COPY --from=builder /app/postcss.config.mjs ./

EXPOSE 3000

CMD ["npm", "run", "start"]
