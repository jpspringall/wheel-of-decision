FROM node:16 AS builder 

WORKDIR /usr/src/app

COPY *.json ./
COPY *.ts ./
COPY src/ ./src

RUN npm install
RUN npm run build:ssr

FROM keymetrics/pm2:16-alpine
COPY --from=builder /usr/src/app/dist /dist
EXPOSE 4000
CMD [ "pm2-runtime", "/dist/server/main.js" ] 