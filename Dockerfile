FROM "node:12.7.0-alpine"
WORKDIR /home/node/app
COPY package.json /home/node/app
RUN npm install
COPY ./src /home/node/app/src
COPY ./tsconfig.json /home/node/app
COPY ./.env /home/node/app
RUN npm run build
