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
# redirection is used here to get rid of ANSI coloring from jest - --color=false or CI=true doesn't help
	npm run test 2>&1

build:
	npm run build

build-docker:
	npm run build:docker
