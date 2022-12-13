APP_NAME = busola-core-ui
APP_PATH = busola-core-ui
SCRIPTS_DIR = $(realpath $(shell pwd)/..)/scripts

include $(SCRIPTS_DIR)/makefile-node-common.mk

install-dependencies: install-root build-shared install-app

build-docker:
	npm run build:docker
