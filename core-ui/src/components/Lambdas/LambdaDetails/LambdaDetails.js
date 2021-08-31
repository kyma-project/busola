import React, { useState } from 'react';
import { useMicrofrontendContext, Tabs, Tab } from 'react-shared';
import { useTranslation } from 'react-i18next';

import CodeTab from './Tabs/Code/CodeTab';
import ResourceManagementTab from './Tabs/ResourceManagement/ResourceManagementTab';
import EventSubscriptionsWrapper from './Tabs/Configuration/EventSubscriptions/EventSubscriptionsWrapper';
import ServiceBindingsWrapper from './Tabs/Configuration/ServiceBindings/ServiceBindingsWrapper';
import ApiRulesWrapper from './Tabs/Configuration/ApiRules/ApiRules';

export default function LambdaDetails({ lambda }) {
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const ApiRules = features?.API_GATEWAY?.isEnabled
    ? ApiRulesWrapper
    : () => null;

  const EventSubscriptions = features?.EVENTING?.isEnabled
    ? EventSubscriptionsWrapper
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
  const defaultHeaderRenderer = () => [
    t('common.headers.name'),
    t('api-rules.list.headers.host'),
    t('common.labels.service'),
    t('api-rules.list.headers.status'),
  ];
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
              lambda={lambda}
              isActive={selectedTabIndex === 1}
              headerRenderer={defaultHeaderRenderer}
            />
            <EventSubscriptions
              ownerName={lambda.metadata.name}
              isActive={selectedTabIndex === 1}
              lambda={lambda}
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
          <ResourceManagementTab lambda={lambda} />
        </Tab>
      </Tabs>
    </>
  );
}
