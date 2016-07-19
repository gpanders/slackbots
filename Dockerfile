FROM node:6.3-wheezy

ENV NODE_ENV "production"

COPY . /src

WORKDIR /src

RUN npm install --unsafe-perm

EXPOSE 9000

CMD ["npm", "start"]
