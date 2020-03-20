FROM node:12.13.0

MAINTAINER Tiennv <tiennv@outlook.com>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Install and run Bower
RUN npm install -g bower
RUN bower install

EXPOSE 8082

CMD ["npm","start"]