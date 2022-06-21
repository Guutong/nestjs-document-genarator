FROM node:16-slim as builder

ENV NODE_ENV build
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --production

FROM zenika/alpine-chrome:100-with-node-16 as app

ENV NODE_ENV dev
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

WORKDIR /app

COPY --from=builder  /app/package*.json ./
COPY --from=builder  /app/node_modules/ ./node_modules/
COPY --from=builder  /app/dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/main.js"]
