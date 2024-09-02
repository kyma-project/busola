#	WORKDIR /build
#
#	RUN apk add --update nodejs npm
#	RUN apk update && apk upgrade
#
#	COPY . /build
#
#	RUN npm ci

##@ General
.DEFAULT_GOAL=help
.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

check-var = $(if $(strip $($1)),,$(error "$1" is not defined))

##@ Environments

prepare-all-dev:
	npm run prepare-all-dev
	ENV=dev make copy-config
prepare-all-stage:
	npm run prepare-all-stage
	ENV=stage make copy-config
prepare-all-prod:
	npm run prepare-all-prod
	ENV=prod make copy-config

prepare-configuration: prepare-all-dev prepare-all-stage prepare-all-prod ## Prepare all configuration for dev, stage and prod

#TODO: migrate it to gulp
copy-config:
	$(call check-var,ENV)
	mkdir -p ./build/${ENV}/config
	cp -r ./environments/${ENV}/config.yaml ./build/${ENV}/config/config.yaml

clean: ##Remove all output directories (dist)
	rm -r ./tmp
	rm -r ./build
