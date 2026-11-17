FROM node:22-alpine
WORKDIR /app
COPY backend/server.js ./server.js
COPY public ./public
ENV NODE_ENV=production DATA_DIR=/data
EXPOSE 3000
CMD ["node", "server.js"]
