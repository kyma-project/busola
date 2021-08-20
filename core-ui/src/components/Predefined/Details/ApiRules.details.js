import React from 'react';

import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';
import { PANEL } from '../../ApiRules/constants';

import {
  CopiableApiRuleHost,
  ApiRuleServiceInfo,
} from 'components/ApiRules/ApiRulesList/components';
import ApiRuleStatus from 'components/ApiRules/ApiRuleStatus/ApiRuleStatus';
import AccessStrategies from 'components/ApiRules/AccessStrategies/AccessStrategies';
import { useGetGatewayDomain as getGatewayDomain } from 'components/ApiRules/hooks/useGetGatewayDomain';

export const ApiRulesDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { domain } = getGatewayDomain();
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('api-rules.list.headers.status'),
      value: resource => <ApiRuleStatus apiRule={resource} />,
    },
    {
      header: t('api-rules.list.headers.service-name'),
      value: resource => <ApiRuleServiceInfo apiRule={resource} />,
    },
    {
      header: t('api-rules.list.headers.host'),
      value: resource => (
        <CopiableApiRuleHost apiRule={resource} domain={domain} />
      ),
    },
  ];

  const ApiRulesAccessStrategies = (resource, resourceUrl) => {
    return (
      <AccessStrategies
        key={`access-strategies-${resource?.metadata.name}`}
        strategies={resource?.spec?.rules || []}
      />
    );
  };

  const editApiRule = apirule => {
    const formattedTitle = t(PANEL.EDIT_MODAL.TITLE, {
      apiRuleName: apirule.metadata.name,
    });
    return (
      <Button
        key={`button-${apirule.metadata.name}`}
        option="transparent"
        onClick={() =>
          LuigiClient.linkManager()
            .fromContext('namespace')
            .withParams({
              serviceName: apirule.spec.service.name,
              port: apirule.spec.service.port,
              openedInModal: true,
              redirectCtx: 'namespaces',
              redirectPath: encodeURIComponent('apirules/'),
            })
            .openAsModal(`apirules/edit/${apirule.metadata.name}`, {
              title: formattedTitle,
            })
        }
      >
        Edit apirule
      </Button>
    );
  };

  return (
    <DefaultRenderer
      resourceHeaderActions={[editApiRule]}
      customColumns={customColumns}
      customComponents={[ApiRulesAccessStrategies]}
      {...otherParams}
    />
  );
};
