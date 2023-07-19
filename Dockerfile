FROM node:lts-bullseye-slim

ARG BUILD_CMD
WORKDIR /app
COPY . /app

RUN npm ci
RUN npm run $BUILD_CMD
RUN rm -rf ./dist/metadata.js

EXPOSE 3000
ENTRYPOINT ["node", "dist/main"]