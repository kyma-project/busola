APP_NAME = busola-backend
BUILDPACK = europe-docker.pkg.dev/kyma-project/dev/test-infra/buildpack-node:PR-6434
IMG_NAME := $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(APP_NAME)
TAG := $(DOCKER_TAG)


build-image: pull-licenses
	docker build -t $(APP_NAME) -f Dockerfile .
push-image:
	docker tag $(APP_NAME):latest $(IMG_NAME):$(TAG)
	docker push $(IMG_NAME):$(TAG)

release: build-image push-image 

pull-licenses:
ifdef LICENSE_PULLER_PATH
	bash $(LICENSE_PULLER_PATH)
else
	mkdir -p licenses
endif
