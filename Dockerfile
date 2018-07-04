FROM node:alpine

# Set environment variables
ENV NODE_ENV=production

# Install app dependencies
RUN apk update && apk upgrade && apk add git

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk add --no-cache make gcc g++ python && \
  npm install --production --silent && \
  apk del make gcc g++ python

COPY . /usr/src/app/
RUN npm install

# Build app
RUN npm run build

ENV HOST 0.0.0.0

# start command
CMD [ "npm", "run", "start" ]
