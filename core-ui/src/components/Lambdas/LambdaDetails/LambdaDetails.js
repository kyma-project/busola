import React, { useState } from 'react';
import { useMicrofrontendContext, Tabs, Tab } from 'react-shared';
import { useTranslation } from 'react-i18next';

import CodeTab from './Tabs/Code/CodeTab';
import ResourceManagement from './Tabs/ResourceManagement/ResourceManagement';
import ServiceBindingsWrapper from './Tabs/Configuration/ServiceBindings/ServiceBindingsWrapper';
import { ApiRulesList } from 'components/ApiRules/ApiRulesList';
import { SubscriptionsList } from 'shared/components/EventSubscriptionsList';

export default function LambdaDetails({ lambda }) {
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const ApiRules = features?.API_GATEWAY?.isEnabled ? ApiRulesList : () => null;

  const Subscriptions = features?.EVENTING?.isEnabled
    ? SubscriptionsList
    : () => null;

  const catalogEnabled =
    features?.SERVICE_CATALOG?.isEnabled &&
    features?.SERVICE_CATALOG_ADDONS?.isEnabled;

  const ServiceBindings = catalogEnabled ? ServiceBindingsWrapper : () => null;

  const configTabShouldRender =
    features?.API_GATEWAY?.isEnabled ||
    features?.EVENTING?.isEnabled ||
    catalogEnabled;

  const { t } = useTranslation();

  return (
    <>
      <Tabs className="lambda-details-tabs" callback={setSelectedTabIndex}>
        <Tab
          key="lambda-code"
          id="lambda-code"
          title={t('functions.details.title.code')}
        >
          <CodeTab lambda={lambda} isActive={selectedTabIndex === 0} />
        </Tab>
        {configTabShouldRender && (
          <Tab
            key="lambda-configuration"
            id="lambda-configuration"
            title={t('functions.details.title.configuration')}
          >
            <ApiRules
              serviceName={lambda.metadata.name}
              namespace={lambda.metadata.namespace}
            />
            <Subscriptions
              serviceName={lambda.metadata.name}
              namespace={lambda.metadata.namespace}
            />
            <ServiceBindings
              lambda={lambda}
              isActive={selectedTabIndex === 1}
            />
          </Tab>
        )}
        <Tab
          key="lambda-resources"
          id="lambda-resources"
          title={t('functions.details.title.resources')}
        >
          <ResourceManagement lambda={lambda} />
        </Tab>
      </Tabs>
    </>
  );
}
