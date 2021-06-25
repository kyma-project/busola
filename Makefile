IMG_NAME = busola-core
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(IMG_NAME)
TAG = $(DOCKER_TAG)

ci-pr: resolve validate validate-libraries
ci-master: resolve validate validate-libraries

.PHONY: resolve
resolve:
	npm run bootstrap:ci

.PHONY: validate
validate:
	# npm run conflict-check
	npm run lint-check
	npm run test-shared-lib
	# npm run markdownlint

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

build-image: 
	docker build -t $(IMG_NAME) -f Dockerfile .

push-image:
	docker tag $(IMG_NAME) $(IMG):$(TAG)
	docker push $(IMG):$(TAG)
