FROM node:buster

RUN apt update
RUN apt install bluetooth bluez libbluetooth-dev libudev-dev -y

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production

CMD [ "node", "dist/index.js" ]