FROM node:17.8.0
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm ci --production

COPY . .

RUN npm run build

CMD [ "node", "dist/index.js" ]