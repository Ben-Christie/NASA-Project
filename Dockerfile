FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

COPY client/package*.json client/

RUN npm run install-client --only=production

# copy server package.json
COPY server/package*.json server/
# now we get the dependencies for our server
RUN npm run install-server --only=production

# copy the entire client folder, this means the build command will only run if the client folder changes or the layers before
COPY client/ client/
# build frontend client
RUN npm run build --prefix client

# copy server folder
COPY server/ server/

USER node

# what to do when this docker container starts up
CMD [ "npm", "start", "--prefix", "server" ]

# expose port we're using to the internet
EXPOSE 8000