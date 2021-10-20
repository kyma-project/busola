IMG_NAME = busola-web
LOCAL_IMG_NAME = busola
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(IMG_NAME)
LOCAL_IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(LOCAL_IMG_NAME)
TAG = $(DOCKER_TAG)

ci-pr: resolve validate validate-libraries
ci-master: resolve validate validate-libraries

.PHONY: resolve
resolve:
	npm run bootstrap:ci

.PHONY: validate
validate:
	npm run lint-check
	npm run test-shared-lib

.PHONY: validate-libraries
validate-libraries:
	cd common && npm run type-check
	cd components/shared && npm run type-check
	cd components/generic-documentation && npm run type-check

.PHONY: lint
lint:
	npm run lint-check

pull-licenses:
ifdef LICENSE_PULLER_PATH
	mkdir -p ../licenses && bash $(LICENSE_PULLER_PATH) --dirs-to-pulling="../"
else
	mkdir -p ../licenses
endif

release: build-image push-image

release-local: build-image-local push-image-local

build-image: 
	sed -i '/version/c\   \"version\" : \"$(TAG)\"' core/src/assets/version.json
	docker build -t $(IMG_NAME) -f Dockerfile .

build-image-local:
	sed -i '/version/c\   \"version\" : \"$(TAG)\"' core/src/assets/version.json
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
	ifeq ($(findstring PR-,$(VARIABLE)),PR-)
    	# Found
	else
		# Not found
		docker tag $(LOCAL_IMG_NAME) $(LOCAL_IMG):latest
		docker push $(LOCAL_IMG):latest
	endif
