import React from 'react';
import LuigiClient from '@luigi-project/client';

import { GenericList, useMicrofrontendContext } from 'react-shared';
import { Button } from 'fundamental-react';

import { formatMessage } from 'components/Lambdas/helpers/misc';
import { ERRORS } from 'components/Lambdas/constants';

import { useDeleteApiRule } from '../hooks/useDeleteApiRule';

import { PANEL } from '../constants';

const defaultHeaderRenderer = () => ['Name', 'Host', 'Service', 'Status'];
const defaultTextSearchProperties = [
  'metadata.name',
  'spec.service.host',
  'status.apiRuleStatus.code',
];
const defaultRowRenderer = () => [];

function editApiRuleModal(
  apiRule,
  inSubView = false,
  redirectPath,
  redirectCtx,
) {
  if (!inSubView) {
    LuigiClient.linkManager()
      .fromContext('namespaces')
      .navigate(`apirules/edit/${apiRule.metadata.name}`);
    return;
  }

  const formattedTitle = formatMessage(PANEL.EDIT_MODAL.TITLE, {
    apiRuleName: apiRule.metadata.name,
  });

  LuigiClient.linkManager()
    .fromContext('namespaces')
    .withParams({
      serviceName: apiRule.spec.service.name,
      port: apiRule.spec.service.port,
      openedInModal: true,
      redirectCtx: redirectCtx,
      redirectPath: encodeURIComponent(redirectPath),
    })
    .openAsModal(
      `${apiRule.metadata.namespace}/apirules/edit/${apiRule.metadata.name}`,
      {
        title: formattedTitle,
      },
    );
}

function createApiRuleModal(
  service,
  inSubView = false,
  redirectPath,
  redirectCtx,
  portForCreate,
  namespaceId,
) {
  if (!inSubView) {
    LuigiClient.linkManager()
      .fromContext('namespaces')
      .navigate(`apirules/create`);
    return;
  }

  LuigiClient.linkManager()
    .fromContext('namespaces')
    .withParams({
      serviceName: service.metadata.name,
      port: portForCreate,
      openedInModal: true,
      redirectCtx: redirectCtx,
      redirectPath: encodeURIComponent(redirectPath),
    })
    .openAsModal(`${namespaceId}/apirules/create`, {
      title: PANEL.CREATE_MODAL.TITLE,
    });
}

function exposeButtonText(resourceType) {
  if (resourceType) {
    return formatMessage(PANEL.EXPOSE_BUTTON.TEXT, {
      type: resourceType,
    });
  }
  return PANEL.CREATE_BUTTON.TEXT;
}

export default function ApiRules({
  service = undefined,
  resourceType = '',
  noTitle = false,
  inSubView = false,
  redirectPath = undefined,
  redirectCtx = undefined,
  portForCreate = undefined,
  headerRenderer = defaultHeaderRenderer,
  rowRenderer = defaultRowRenderer,
  textSearchProperties = defaultTextSearchProperties,
  apiRules = [],
  serverDataError,
  serverDataLoading,
  disableExposeButton = false,
}) {
  const deleteApiRule = useDeleteApiRule();
  const { namespaceId } = useMicrofrontendContext();

  const actions = [
    {
      name: 'Edit',
      disabledHandler: apiRule => !!apiRule.ownerSubscription, // TODO what is this ownerSubscription?
      handler: apiRule => {
        return editApiRuleModal(apiRule, inSubView, redirectPath, redirectCtx);
      },
    },
    {
      name: 'Delete',
      disabledHandler: apiRule => !!apiRule.ownerSubscription, // TODO what is this ownerSubscription?
      handler: apiRule => {
        deleteApiRule(apiRule.metadata.name);
      },
    },
  ];

  const exposeServiceButton = (
    <Button
      glyph="add"
      option="transparent"
      onClick={() =>
        createApiRuleModal(
          service,
          inSubView,
          redirectPath,
          redirectCtx,
          portForCreate,
          namespaceId,
        )
      }
      disabled={disableExposeButton || !!(serverDataLoading || serverDataError)}
    >
      {exposeButtonText(resourceType)}
    </Button>
  );

  const notFoundMessage = formatMessage(PANEL.LIST.ERRORS.RESOURCES_NOT_FOUND, {
    resourceType: resourceType || 'Namespace',
  });

  return (
    <div>
      <GenericList
        title={noTitle ? '' : PANEL.LIST.TITLE}
        showSearchField={true}
        textSearchProperties={textSearchProperties}
        showSearchSuggestion={false}
        extraHeaderContent={exposeServiceButton}
        actions={actions}
        entries={apiRules}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        serverDataError={serverDataError}
        serverDataLoading={serverDataLoading}
        notFoundMessage={notFoundMessage}
        noSearchResultMessage={PANEL.LIST.ERRORS.NOT_MATCHING_SEARCH_QUERY}
        serverErrorMessage={ERRORS.SERVER}
      />
    </div>
  );
}
