import React from 'react';
import LuigiClient from '@luigi-project/client';

import { GenericList } from 'react-shared';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { formatMessage } from 'components/Lambdas/helpers/misc';
import { ERRORS } from 'components/Lambdas/constants';

import { useDeleteApiRule } from '../hooks/useDeleteApiRule';

import { PANEL } from '../constants';

const defaultTextSearchProperties = [
  'metadata.name',
  'spec.service.host',
  'status.apiRuleStatus.code',
];
const defaultRowRenderer = () => [];

function exposeButtonText(resourceType, t) {
  if (resourceType) {
    return t(PANEL.EXPOSE_BUTTON.TEXT, {
      type: resourceType,
    });
  }
  return t(PANEL.CREATE_BUTTON.TEXT);
}

export default function ApiRules({
  service = undefined,
  resourceType = '',
  noTitle = false,
  inSubView = false,
  redirectPath = undefined,
  redirectCtx = undefined,
  portForCreate = undefined,
  headerRenderer,
  rowRenderer = defaultRowRenderer,
  textSearchProperties = defaultTextSearchProperties,
  apiRules = [],
  serverDataError,
  serverDataLoading,
  disableExposeButton = false,
}) {
  const deleteApiRule = useDeleteApiRule();
  const { t, i18n } = useTranslation();

  const actions = [
    {
      name: t('common.buttons.edit'),
      icon: 'edit',
      disabledHandler: apiRule => !!apiRule.ownerSubscription, // TODO what is this ownerSubscription?
      // handler: apiRule => {
      //   return editApiRuleModal(
      //     apiRule,
      //     inSubView,
      //     redirectPath,
      //     redirectCtx,
      //     t,
      //   );
      // },
    },
    {
      name: t('common.buttons.delete'),
      icon: 'delete',
      disabledHandler: apiRule => !!apiRule.ownerSubscription, // TODO what is this ownerSubscription?
      handler: apiRule => {
        deleteApiRule(apiRule.metadata.name, t);
      },
    },
  ];

  // const exposeServiceButton = (
  //   <Button
  //     glyph="add"
  //     option="transparent"
  //     onClick={() =>
  //       createApiRuleModal(
  //         service,
  //         inSubView,
  //         redirectPath,
  //         redirectCtx,
  //         portForCreate,
  //         t,
  //       )
  //     }
  //     disabled={disableExposeButton || !!(serverDataLoading || serverDataError)}
  //   >
  //     {exposeButtonText(resourceType, t)}
  //   </Button>
  // );

  const notFoundMessage = formatMessage(PANEL.LIST.ERRORS.RESOURCES_NOT_FOUND, {
    resourceType: resourceType || 'Namespace',
  });

  return (
    <div>
      <GenericList
        title={noTitle ? '' : t(PANEL.LIST.TITLE)}
        showSearchField={true}
        textSearchProperties={textSearchProperties}
        showSearchSuggestion={false}
        // extraHeaderContent={exposeServiceButton}
        actions={actions}
        entries={apiRules}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        serverDataError={serverDataError}
        serverDataLoading={serverDataLoading}
        notFoundMessage={notFoundMessage}
        noSearchResultMessage={t(PANEL.LIST.ERRORS.NOT_MATCHING_SEARCH_QUERY)}
        serverErrorMessage={t(ERRORS.SERVER)}
        i18n={i18n}
      />
    </div>
  );
}
