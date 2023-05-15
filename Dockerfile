FROM node:lts-bullseye-slim

WORKDIR /app
COPY . /app

RUN npm clean install
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main"]