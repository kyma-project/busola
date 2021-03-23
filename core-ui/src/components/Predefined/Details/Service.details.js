import React from 'react';
import LuigiClient from '@luigi-project/client';
import { getComponentForList } from 'shared/getComponents';
import { Button } from 'fundamental-react';
import CreateApiRule from 'components/ApiRules/CreateApiRule/CreateApiRule.js';

export const ServicesDetails = DefaultRenderer => ({ ...otherParams }) => {
  function createApiRuleModal(
    service,

    redirectPath,
    redirectCtx,
    portForCreate,
  ) {
    LuigiClient.linkManager()
      .fromContext('namespaces')
      .withParams({
        serviceName: 'service.metadata.name',
        port: 'portForCreate',
        openedInModal: true,
        redirectCtx: null,
        redirectPath: encodeURIComponent('redirectPath'),
      })
      .openAsModal(`apirules/create`, {
        title: 'PANEL.CREATE_MODAL.TITLE',
      });
  }

  const exposeServiceButton = (
    <Button
      glyph="add"
      option="light"
      onClick={() => createApiRuleModal()}
      // disabled={disableExposeButton || !!(serverDataLoading || serverDataError)}
    >
      Expose
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
