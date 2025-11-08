FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source and build
COPY tsconfig.json ./
COPY server ./server
COPY shared ./shared
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8080

# Run built server
CMD ["node", "dist/index.js"]
