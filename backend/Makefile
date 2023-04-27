APP_NAME = busola-backend
IMG_NAME := $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(APP_NAME)
TAG := $(DOCKER_TAG)


build-image:
	docker build -t $(APP_NAME) -f Dockerfile .
push-image:
	docker tag $(APP_NAME):latest $(IMG_NAME):$(TAG)
	docker push $(IMG_NAME):$(TAG)

release: build-image push-image 
