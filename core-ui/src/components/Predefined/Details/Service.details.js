import React from 'react';
import LuigiClient from '@luigi-project/client';
import { getComponentForList } from 'shared/getComponents';
import { Button } from 'fundamental-react';

export const ServicesDetails = DefaultRenderer => ({ ...otherParams }) => {
  function openCreateApiRuleModal() {
    LuigiClient.linkManager()
      .fromContext('namespaces')
      .withParams({
        serviceName: otherParams.resourceName,
        openedInModal: true,
      })
      .openAsModal(`apirules/create`, {
        title: `Create API Rule for the ${otherParams.resourceName} service`,
      });
  }

  const exposeServiceButton = (
    <Button
      glyph="add"
      option="light"
      onClick={openCreateApiRuleModal}
      disabled={!otherParams.resourceName}
    >
      Add API Rule for this service
    </Button>
  );

  const ApiRuleList = getComponentForList({
    name: 'apiruleList',
    params: {
      listHeaderActions: exposeServiceButton,
      hasDetailsView: true,
      fixedPath: true,
      resourceUrl: `/apis/gateway.kyma-project.io/v1alpha1/namespaces/${otherParams.namespace}/apirules`,
      resourceType: 'apirules',
      namespace: otherParams.namespace,
      isCompact: true,
      showTitle: true,
      filter: apirule => apirule.spec.service.name === otherParams.resourceName,
    },
  });
  return <DefaultRenderer {...otherParams}>{ApiRuleList}</DefaultRenderer>;
};
