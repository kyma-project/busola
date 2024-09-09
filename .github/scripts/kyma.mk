PROJECT_ROOT=./
LOCALBIN ?= $(realpath $(PROJECT_ROOT))/bin
$(LOCALBIN):
	mkdir -p $(LOCALBIN)


KYMA ?= $(LOCALBIN)/kyma
kyma: $(LOCALBIN) $(KYMA) ## Download kyma locally if necessary.
$(KYMA):
	$(eval OS=$(shell (uname -s | tr 'A-Z' 'a-z')))
	curl --location --output $(LOCALBIN)/kyma https://storage.googleapis.com/kyma-cli-unstable/kyma-${OS}
	chmod +x $(LOCALBIN)/kyma
