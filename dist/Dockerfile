FROM node:0.12
MAINTAINER G.P. Anders <greg@gpanders.com>

# Bundle app source
COPY . /src

# Install app dependencies
RUN cd /src; npm install

EXPOSE 9000

#CMD /usr/bin/mongod --fork --logpath /var/log/mongod.log && node /src/index.js
CMD ["node", "/src/index.js"]
