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

build-image:
	docker build --build-arg=TAG_default_tag=$(TAG) -t $(IMG_NAME) -f Dockerfile .

build-image-local:
	docker build -t $(LOCAL_IMG_NAME) -f Dockerfile.local .

push-image:
	docker tag $(IMG_NAME) $(IMG):$(TAG)
	docker push $(IMG):$(TAG)
ifeq ($(JOB_TYPE), postsubmit)
	@echo "Sign image with Cosign"
	cosign version
	cosign sign -key ${KMS_KEY_URL} $(REPO)$(IMG):$(TAG)
else
	@echo "Image signing skipped"
endif

push-image-local:
	docker tag $(LOCAL_IMG_NAME) $(LOCAL_IMG):$(TAG)
	docker push $(LOCAL_IMG):$(TAG)
ifeq ($(JOB_TYPE), postsubmit)
	@echo "Tag image with latest"
	docker tag $(LOCAL_IMG_NAME) $(LOCAL_IMG):latest
	docker push $(LOCAL_IMG):latest
else
	@echo "Image tagging with latest skipped"
endif
