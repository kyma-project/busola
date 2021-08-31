import React from 'react';
import { Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'react-shared';

import { prettySourceType } from 'components/Lambdas/helpers/lambdas';
import { prettyRuntime } from 'components/Lambdas/helpers/runtime';
import { LambdaStatusBadge } from 'components/Lambdas/LambdaStatusBadge/LambdaStatusBadge';
import CreateNewFunction from './CreateNewFunction';
import { useTranslation } from 'react-i18next';

export const FunctionsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;

  function goToGitRepositories() {
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`gitrepositories`);
  }

  const headerActions = features?.SERVERLESS?.isEnabled ? (
    <Button option="transparent" onClick={goToGitRepositories}>
      {t('functions.buttons.connected-repositories')}
    </Button>
  ) : null;

  const listActions = (
    <CreateNewFunction namespaceName={otherParams.namespace} />
  );

  const customColumns = [
    {
      header: t('functions.headers.runtime'),
      value: func => {
        return prettyRuntime(func.spec.runtime);
      },
    },
    {
      header: t('functions.headers.source-type'),
      value: func => {
        return prettySourceType(func.spec.type);
      },
    },
    {
      header: t('common.headers.status'),
      value: resource => <LambdaStatusBadge status={resource.status} />,
    },
  ];

  return (
    <DefaultRenderer
      customHeaderActions={headerActions}
      listHeaderActions={listActions}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
