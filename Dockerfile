# declare that we're using node where we want to use the latest (lts) version for alpine linux
# change from lts-alpine to 14-alpine (or another version of node)
FROM node:14-alpine

# create the working directory (folder) for our application, this is where our files will live
WORKDIR /app

# docker layers minimise the amount of work that needs to be done when building a docker image by making it easier to cache

# copy files from local machine into docker image, we use package.json folder as the source (as this is all we need to install dependencies) and the ./ declares our destination to be the /app directory we created above, asterisk (*) says we want to include the package-lock.json as well, if this causes issues remove and we'll just install the latest versions of the packages
COPY package*.json ./

# by putting both these Copy commands above the client npm install, it  means the client layer will only be updated when either the root package.json or client package.json are updated
COPY client/package*.json client/

# run some commands to setup our project, any dependencies required for dev work wont be installed i.e. jest, nodemon, etc create .dockerignore file and add node_modules (as well as .git and server/public as this is created by the build command in the client script (ignore anything else that can be created like this as well)) to it so we can do a clean install and exclude any dev dependencies before building our client we only need the dependencies for the client
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

# security step, by default user is set to root user which exposes everything within the container, here we declare node as the user which gives a lot less control 
# and minimises the damage a hacker could do
USER node

# what to do when this docker container starts up
CMD [ "npm", "start", "--prefix", "server" ]

# expose port we're using to the internet
EXPOSE 8000

# to build docker file, in terminal:

# 1. run docker build and the path (in our case the local directory can just be denoted with .) 
# -t tags the docker image put our username for docker i.e. ben11 and the name of our project
# ben11/nasa-project
# i.e. docker build . -t
# docker build . ben11/nasa-project

# 2. run docker file in terminal:
# docker run -p port:port image -it 
# docker run -it -p 8000:8000 ben11/nasa-project

# push to docker hub image repository using:  docker push ben11/nasa-project

# after setting up AWS EC2 instance we need to connect via ssh:
# go to folder where kep pair is stored: cd C:\Users\bench\Documents\AWS_Key_Pairs
# run command that should look like this: ssh -i "nasa-project-key-pair.pem" ec2-user@ec2-54-195-144-156.eu-west-1.compute.amazonaws.com OR ssh -i "nasa-project-key-pair.pem" ec2-user@54.195.144.156 (after the @ we have to IP Address of our EC2 instance)

# once connected to  linux shell, install docker using yum (package manager like npm)
# sudo yum update -y
# sudo yum install docker

# start docker
# sudo service docker start
# to run any docker commands we need to do sudo docker <command>

# if we dont want to use sudo we can add teh EC2 user to the group
# sudo usermod -a -G docker ec2-user
# then exit and log back in using ssh -i "nasa-project-key-pair.pem" ec2-user@54.195.144.156

# to deploy our docker image to AWS:
# docker-compose or amazon ecs (costs money) are popular
# login to docker hub account (if docker image is private) - docker login

# run container
# docker run --restart=always -p 8000:8000 ben11/nasa-project
# if we go to IP:PORT e.g. 54.195.144.156:8000 we'll see our project running, this will always be available now on the internet