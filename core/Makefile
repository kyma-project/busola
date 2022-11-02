IMG_NAME = busola-core
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(IMG_NAME)
TAG = $(DOCKER_TAG)

resolve:
	cd .. && npm ci --no-optional # Install common dependencies 
	npm ci

verify: lint test 

lint:
	npm run lint-check

test:
	CI=true npm run test

build:
	npm run build

build-docker:
	npm run build:docker
