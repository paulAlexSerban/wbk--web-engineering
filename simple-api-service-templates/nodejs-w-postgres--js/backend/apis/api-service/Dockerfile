ARG PROJECT_NAME
ARG LOCAL_BASE_IMAGE=${PROJECT_NAME}-local-base:latest
FROM ${LOCAL_BASE_IMAGE}

ARG NODE_PORT

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package.json ./pnpm-workspace.yaml /usr/src/app/

RUN pnpm install
# if you build you code for production
# RUN pnpm ci --frozen-lockfile

# Expose the port the app runs on
EXPOSE ${NODE_PORT}

# Bundle app source
COPY ./ /usr/src/app/

# Command to run when the container is ready
# Separate arguments as separate values in the array
CMD [ "pnpm", "start"]