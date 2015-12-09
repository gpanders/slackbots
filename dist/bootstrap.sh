#!/usr/bin/env bash

HOME="/home/vagrant"

apt-get install -y curl

# Note the new setup script name for Node.js v0.12
curl -sL https://deb.nodesource.com/setup_0.12 | bash -

# Then install with:
apt-get install -y nodejs mongodb

# Add mongo to hosts file
echo "127.0.0.1 mongo " >> /etc/hosts
