import React, { useState } from 'react';
import { Tab } from 'shared/components/Tabs/Tab';
import { Tabs } from 'shared/components/Tabs/Tabs';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useTranslation } from 'react-i18next';

import CodeTab from './Tabs/Code/CodeTab';
import ResourceManagement from './Tabs/ResourceManagement/ResourceManagement';
import ServiceBindingsWrapper from './Tabs/Configuration/ServiceBindings/ServiceBindingsWrapper';
import { ApiRulesList } from 'components/ApiRules/ApiRulesList';
import { SubscriptionsList } from 'shared/components/SubscriptionsList';

export default function FunctionDetails({ func }) {
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
      <Tabs className="function-details-tabs" callback={setSelectedTabIndex}>
        <Tab
          key="function-code"
          id="function-code"
          title={t('functions.details.title.code')}
        >
          <CodeTab func={func} isActive={selectedTabIndex === 0} />
        </Tab>
        {configTabShouldRender && (
          <Tab
            key="function-configuration"
            id="function-configuration"
            title={t('functions.details.title.configuration')}
          >
            <ApiRules
              prefix={func.metadata.name}
              serviceName={func.metadata.name}
              namespace={func.metadata.namespace}
            />
            <Subscriptions
              prefix={func.metadata.name}
              serviceName={func.metadata.name}
              namespace={func.metadata.namespace}
            />
            <ServiceBindings func={func} isActive={selectedTabIndex === 1} />
          </Tab>
        )}
        <Tab
          key="function-resources"
          id="function-resources"
          title={t('functions.details.title.resources')}
        >
          <ResourceManagement func={func} />
        </Tab>
      </Tabs>
    </>
  );
}
