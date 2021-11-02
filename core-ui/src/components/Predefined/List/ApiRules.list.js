import React from 'react';
import { Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { PANEL } from '../../ApiRules/constants';
import {
  CopiableApiRuleHost,
  ApiRuleServiceInfo,
} from 'components/ApiRules/ApiRulesList/components';
import ApiRuleStatus from 'components/ApiRules/ApiRuleStatus/ApiRuleStatus';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';

export const ApiRulesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const createApiRule = (
    <Button
      glyph="add"
      option="transparent"
      onClick={() =>
        LuigiClient.linkManager()
          .fromContext('namespace')
          .withParams({
            serviceName: otherParams.serviceName,
            port: otherParams.port,
            openedInModal: true,
            redirectCtx: 'namespaces',
            redirectPath: encodeURIComponent('apirules/'),
          })
          .openAsModal(`apirules/create`, {
            title: t(PANEL.CREATE_MODAL.TITLE),
          })
      }
    >
      {t('api-rules.buttons.create')}
    </Button>
  );

  const customColumns = [
    {
      header: t('api-rules.list.headers.host'),
      value: apiRule => <CopiableApiRuleHost apiRule={apiRule} />,
    },
    {
      header: t('api-rules.list.headers.service-name'),
      value: apiRule => <ApiRuleServiceInfo apiRule={apiRule} />,
    },
    {
      header: t('api-rules.list.headers.status'),
      value: apiRule => <ApiRuleStatus apiRule={apiRule} />,
    },
  ];

  const description = (
    <span>
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/apix-01-apirule/#documentation-content"
        text="API Rule"
      />
      {t('api-rules.description')}
    </span>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      listHeaderActions={createApiRule}
      resourceName={t('api-rules.title')}
      description={description}
      {...otherParams}
    />
  );
};
