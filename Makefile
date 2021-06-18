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

lint:
	npm run lint-check
	
pull-licenses:
ifdef LICENSE_PULLER_PATH
	bash $(LICENSE_PULLER_PATH) --dirs-to-pulling="../common,../components/react,../components/shared,../components/generic-documentation"
else
	mkdir -p licenses
endif
