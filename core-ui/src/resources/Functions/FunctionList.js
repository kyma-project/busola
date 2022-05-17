import React from 'react';
import { Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ExternalLink } from 'shared/components/Link/ExternalLink';

import { prettySourceType } from 'components/Functions/helpers/functions';
import { prettyRuntime } from 'components/Functions/helpers/runtime';
import { FunctionStatusBadge } from 'components/Functions/FunctionStatusBadge/FunctionStatusBadge';
import { useTranslation, Trans } from 'react-i18next';

import { FunctionCreate } from './FunctionCreate';

export function FunctionList(props) {
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
        <FunctionStatusBadge
          resourceKind={props.resourceType}
          status={resource.status}
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="functions.description">
      <ExternalLink
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
      createResourceForm={FunctionCreate}
      {...props}
    />
  );
}

export default FunctionList;
