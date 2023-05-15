FROM node:lts-bullseye-slim

WORKDIR /app
COPY . /app

RUN npm ci
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main"]