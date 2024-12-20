APP_NAME = busola-web
IMG_NAME = busola-web
LOCAL_IMG_NAME = busola
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(IMG_NAME)
LOCAL_IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(LOCAL_IMG_NAME)
KYMA_DASHBOARD_IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(KYMA_DASHBOARD_IMG_NAME)
TAG = $(DOCKER_TAG)

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
	docker build -t $(APP_NAME) -f Dockerfile.web .

install-busola-web: build-image ## Build busola web image and install it on local k3d cluster
	$(eval HASH_TAG=$(shell docker images $(APP_NAME):latest --quiet))
	docker tag $(APP_NAME) $(APP_NAME):$(HASH_TAG)

	k3d image import $(APP_NAME):$(HASH_TAG) -c kyma
	kubectl set image deployment web busola=$(APP_NAME):$(HASH_TAG)
