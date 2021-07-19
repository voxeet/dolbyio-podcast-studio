FROM node:16-alpine

LABEL org.opencontainers.image.authors="fabien.lavocat@dolby.com"

WORKDIR /usr/src/podcast

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build:docker

EXPOSE 8081

CMD [ "node", "dist/server/index.js", "--port", "8081" ]
