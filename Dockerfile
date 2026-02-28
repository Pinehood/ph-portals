FROM node:lts-bullseye-slim

ARG BUILD_CMD

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.9.0 --activate

WORKDIR /app
COPY . /app

RUN pnpm install --frozen-lockfile
RUN pnpm run build:swc

EXPOSE 3000
ENTRYPOINT ["node", "dist/main"]