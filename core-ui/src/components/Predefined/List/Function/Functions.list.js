import React from 'react';
import { Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext, Link, ResourcesList } from 'react-shared';

import { prettySourceType } from 'components/Lambdas/helpers/lambdas';
import { prettyRuntime } from 'components/Lambdas/helpers/runtime';
import { LambdaStatusBadge } from 'components/Lambdas/LambdaStatusBadge/LambdaStatusBadge';
import { useTranslation, Trans } from 'react-i18next';
import { FunctionsCreate } from 'components/Predefined/Create/Functions/Functions.create';

const FunctionsList = props => {
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
        return prettySourceType(func.spec.type, t);
      },
    },
    {
      header: t('common.headers.status'),
      value: resource => (
        <LambdaStatusBadge
          resourceKind={props.resourceType}
          status={resource.status}
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="functions.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/svls-01-function/#documentation-content/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customHeaderActions={headerActions}
      customColumns={customColumns}
      description={description}
      createResourceForm={FunctionsCreate}
      {...props}
    />
  );
};

export default FunctionsList;
