FROM node:16 AS builder 

WORKDIR /usr/src/app

COPY *.json ./
COPY *.ts ./
COPY src/ ./src

RUN npm install
RUN npm run build:ssr

#https://learn.microsoft.com/en-us/azure/app-service/configure-custom-container?pivots=container-linux&tabs=debian#enable-ssh
#https://blog.kloud.com.au/2017/08/22/preparing-your-docker-container-for-azure-app-services/
FROM keymetrics/pm2:16-alpine
COPY --from=builder /usr/src/app/dist /dist
COPY sshd_config /etc/ssh/
COPY ecosystem.config.js /
# Start and enable SSH
RUN apk add openssh \
    && echo "root:Docker!" | chpasswd \
    && cd /etc/ssh/ \
    && ssh-keygen -A
# SSH
EXPOSE 2222 
# Web App
EXPOSE 4000
CMD [ "pm2-runtime", "start","/ecosystem.config.js" ]