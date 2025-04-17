FROM node:20.11.1-bullseye-slim

ARG BUILD_CMD
WORKDIR /app
COPY . /app

RUN npm install
RUN npm run $BUILD_CMD

EXPOSE 3000
ENTRYPOINT ["node", "dist/main"]