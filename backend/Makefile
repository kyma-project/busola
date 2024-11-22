APP_NAME = busola-backend

##@ General
.DEFAULT_GOAL=help
.PHONY: help
.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)


build-image: ## Build busola backend image
	docker build -t $(APP_NAME) -f Dockerfile .

install-busola-backend: build-image ## Build busola backend image and install it on local k3d cluster
	$(eval HASH_TAG=$(shell docker images $(APP_NAME):latest --quiet))
	docker tag $(APP_NAME) $(APP_NAME):$(HASH_TAG)

	k3d image import $(APP_NAME):$(HASH_TAG) -c kyma
	kubectl set image deployment backend backend=$(APP_NAME):$(HASH_TAG)
