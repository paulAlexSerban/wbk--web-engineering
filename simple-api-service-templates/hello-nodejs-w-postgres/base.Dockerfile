# Local monorepo base image - build context: monorepo root

FROM node:24-alpine
LABEL maintainer="paulserban.eu"

RUN apk add --no-cache python3 make g++ libc6-compat

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@11.5.0 --activate
