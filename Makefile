APP_NAME = busola
.DEFAULT_GOAL=help

help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)


.PHONY: resolve
resolve:
	npm install

.PHONY: validate
validate:
	npm run lint-check

.PHONY: lint
lint:
	npm run lint-check

release: build-image push-image

release-local: build-image-local push-image-local

build-image: ## Build busola backend image
	docker build -t $(APP_NAME) -f Dockerfile .

install-busola: build-image ## Build busola web image and install it on local k3d cluster
	$(eval HASH_TAG=$(shell docker images $(APP_NAME):latest --quiet))
	docker tag $(APP_NAME) $(APP_NAME):$(HASH_TAG)

	k3d image import $(APP_NAME):$(HASH_TAG) -c kyma
	kubectl set image deployment busola busola=$(APP_NAME):$(HASH_TAG)
