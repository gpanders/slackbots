# slackbots

Source code for the slackbots webapp.

All contents in this repository are protected under the MIT license.

This app is also available on Docker [here](https://hub.docker.com/r/ganders/slackbots/).

To run the Docker container you must specify a `MONGO_URI` environment variable that
points to a running Mongo instance, i.e.

    docker run --name slackbots -p 9000:9000 -d -e MONGO_URI=mongo://some.mongo.instance/slackbots ganders/slackbots
