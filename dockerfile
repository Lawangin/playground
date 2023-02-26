FROM node:18.12.1-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn run lint

CMD [ "yarn", "start" ]
