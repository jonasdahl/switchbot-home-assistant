FROM node:buster

RUN apt update
RUN apt install bluetooth bluez libbluetooth-dev libudev-dev -y

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm ci

COPY . .

RUN npm run build

CMD [ "node", "dist/index.js" ]