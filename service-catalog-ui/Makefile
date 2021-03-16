APP_NAME = busola-service-catalog-ui
APP_PATH = busola-service-catalog-ui
BUILDPACK = eu.gcr.io/kyma-project/test-infra/buildpack-node:v20200428-02dd40a1
SCRIPTS_DIR = $(realpath $(shell pwd)/..)/scripts

include $(SCRIPTS_DIR)/makefile-node-common.mk

pull-licenses:
ifdef LICENSE_PULLER_PATH
	bash $(LICENSE_PULLER_PATH) --dirs-to-pulling="../,../common,../components/react,../components/shared,../components/generic-documentation"
else
	mkdir -p licenses
endif