# slackbots

A webapp to create and control your horde of Slack Bots.

## File structure

The root directory contains the "working" directory where the build processes and source files live. The *app* directory contains the front-end Angular webapp, and the *test* directory contains Karma unit tests.

The *dist* directory contains the Node back-end (in the *models* directory and the *index.js* entry point) as well as the production files in the *public* directory. Distribution config files (`Dockerfile` and `Vagrantfile`) are stored here as well. See below for information on deployment.

## Build

Make sure you have all of the required dependencies

    npm install && bower install

Run `grunt` or `grunt build` for building and `grunt serve` for preview.

## Deploy to Vagrant

Run `grunt` or `grunt build` to build the production files, then

    cd dist && npm install
    vagrant up
    vagrant ssh -- node /vagrant/index.js

The Vagrant VM forwards localhost port 9000 to the VM, so you can access the site at `localhost:9000`

## Deploy to Docker

*NOTE:* You must have a Mongo DB docker container running to connect to before starting the slackbots Docker container

    docker run --name mongo -v /data/db:/data/db -d mongo

If you want to create a local Docker version, follow the steps below. Otherwise, skip this step to use the image on Docker Hub.

    grunt
    cd dist
    docker build -t ganders/slackbots .

To start the Docker container

    docker run --name slackbots --link mongo:mongo -p 9000:9000 -d ganders/slackbots

Run `docker-machine ip default` or `boot2docker ip` to get the IP address of the Docker VM. The webapp can be accessed at port **9000** of that IP address.

Example:

    curl "$(docker-machine ip default):9000"

To stop the Docker container,

    docker stop slackbots

And to resume it again,

    docker start slackbots

To destroy and remove the slackbots Docker image,

    docker kill slackbots
    docker rm slackbots

## Testing

Running `grunt test` will run the unit tests with karma.
