# slackbots

A webapp to create and control your horde of Slack Bots.

You will need a Slack API token which you can get [here](https://api.slack.com/web).

## Get started

The fastest way to get this webapp up and running is to use Docker. There is already a Docker image available on Docker Hub that you can get started in one command (assuming you already have [Docker](http://docker.com) installed).

**NOTE:** You must have a Mongo DB Docker container running to connect to before starting the slackbots Docker container

    docker create volume --name mongo-data
    docker run --name mongo -v mongo-data:/data/db -d mongo

To start the Docker container

    docker run --name slackbots --link mongo:mongo -p 9000:9000 -d ganders/slackbots

Run `docker-machine ip default` or `boot2docker ip` to get the IP address of the Docker VM. The webapp can be accessed at port **9000** of that IP address.

Example:

    curl "$(docker-machine ip default):9000"

To stop the Docker container,

    docker stop slackbots

And to resume it again,

    docker start slackbots

To destroy and remove the slackbots Docker container,

    docker kill slackbots
    docker rm slackbots

And to completely remove the local Docker image,

    docker rmi ganders/slackbots

## Source

If you want to make changes to the webapp, you can download the source and deploy locally to a Vagrant VM

    git clone git@github.com:gpanders/slackbots.git
    cd slackbots
    npm install && bower install
    grunt

### File structure

The root directory contains the "working" directory where the build processes and source files live. The **app** directory contains the front-end Angular webapp, and the **test** directory contains Karma unit tests.

The **dist** directory contains the Node back-end (in the **models** directory and the **index.js** entry point) as well as the Grunt-generated production files in the **public** directory. Distribution config files (`Dockerfile` and `Vagrantfile`) are stored here as well. See below for information on deployment.

### Deploy to Vagrant

Requires [Vagrant](http://vagrantup.com) to be installed.

Spin up a Vagrant VM and the run the webapp inside the VM

    cd dist && npm install
    vagrant up
    vagrant ssh -- node /vagrant/index.js

The Vagrant VM forwards localhost port 9000 to the VM, so you can access the site at `localhost:9000`

## Testing

Running `grunt test` will run the unit tests with karma.
