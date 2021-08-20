import React, { useState } from 'react';
import { useMicrofrontendContext, Tabs, Tab } from 'react-shared';
import { useTranslation } from 'react-i18next';

import CodeTab from './Tabs/Code/CodeTab';
import ResourceManagementTab from './Tabs/ResourceManagement/ResourceManagementTab';
import EventSubscriptionsWrapper from './Tabs/Configuration/EventSubscriptions/EventSubscriptionsWrapper';
import ServiceBindingsWrapper from './Tabs/Configuration/ServiceBindings/ServiceBindingsWrapper';
import ApiRulesWrapper from './Tabs/Configuration/ApiRules/ApiRules';

import { LAMBDA_DETAILS } from 'components/Lambdas/constants';

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
          title={LAMBDA_DETAILS.TABS.CODE.TITLE}
        >
          <CodeTab lambda={lambda} isActive={selectedTabIndex === 0} />
        </Tab>
        {configTabShouldRender && (
          <Tab
            key="lambda-configuration"
            id="lambda-configuration"
            title={LAMBDA_DETAILS.TABS.CONFIGURATION.TITLE}
          >
            <ApiRules
              lambda={lambda}
              isActive={selectedTabIndex === 1}
              headerRenderer={defaultHeaderRenderer}
            />
            <EventSubscriptions
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
          title={LAMBDA_DETAILS.TABS.RESOURCE_MANAGEMENT.TITLE}
        >
          <ResourceManagementTab lambda={lambda} />
        </Tab>
      </Tabs>
    </>
  );
}
