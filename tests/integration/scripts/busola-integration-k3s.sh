#!/bin/bash

set -e

apk add --no-cache xvfb gtk+3.0-dev gtk+2.0-dev libnotify-dev mesa-dev nss-dev libx11 alsa-lib-dev libxtst xauth

VERSION=v16.20.0
DISTRO=linux-x64

curl -Lo node.tar.xz https://unofficial-builds.nodejs.org/download/release/$VERSION/node-$VERSION-$DISTRO-musl.tar.xz
mkdir -p /usr/local/lib/nodejs
tar -xJvf node.tar.xz -C /usr/local/lib/nodejs 

export PATH=/usr/local/lib/nodejs/node-$VERSION-$DISTRO-musl/bin:$PATH

echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "Copying Kubeconfig"
k3d kubeconfig get k3d > tests/integration/fixtures/kubeconfig.yaml
k3d kubeconfig get k3d > tests/integration/fixtures/kubeconfig-k3s.yaml

echo "Installing Busola"
npm install

echo "Starting Busola"
npm start 2>&1 &
sleep 80

echo "Run Cypress"
cd tests/integration
npm install --save-dev
npm run test:cluster
