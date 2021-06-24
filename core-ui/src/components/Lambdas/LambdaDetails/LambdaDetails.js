import React, { useState } from 'react';
import { useMicrofrontendContext, modulesExist, Tabs, Tab } from 'react-shared';

import CodeTab from './Tabs/Code/CodeTab';
import ResourceManagementTab from './Tabs/ResourceManagement/ResourceManagementTab';
import EventSubscriptionsWrapper from './Tabs/Configuration/EventSubscriptions/EventSubscriptionsWrapper';
import ServiceBindingsWrapper from './Tabs/Configuration/ServiceBindings/ServiceBindingsWrapper';
import ApiRulesWrapper from './Tabs/Configuration/ApiRules/ApiRules';

import { LAMBDA_DETAILS } from 'components/Lambdas/constants';

export default function LambdaDetails({ lambda }) {
  const [bindingUsages, setBindingUsages] = useState([]);
  const microfrontendContext = useMicrofrontendContext();
  const { crds, modules } = microfrontendContext;
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const ApiRules = modulesExist(crds, [modules?.API_GATEWAY])
    ? ApiRulesWrapper
    : () => null;

  const EventSubscriptions = modulesExist(crds, [modules?.EVENTING])
    ? EventSubscriptionsWrapper
    : () => null;

  const ServiceBindings = modulesExist(crds, [
    modules?.SERVICE_CATALOG,
    modules?.SERVICE_CATALOG_ADDONS,
  ])
    ? ServiceBindingsWrapper
    : () => null;

  const configTabShouldRender =
    modulesExist(crds, [modules?.API_GATEWAY]) ||
    modulesExist(crds, [modules?.EVENTING]) ||
    modulesExist(crds, [
      modules?.SERVICE_CATALOG,
      modules?.SERVICE_CATALOG_ADDONS,
    ]);

  return (
    <>
      <Tabs className="lambda-details-tabs" callback={setSelectedTabIndex}>
        <Tab
          key="lambda-code"
          id="lambda-code"
          title={LAMBDA_DETAILS.TABS.CODE.TITLE}
        >
          <CodeTab
            lambda={lambda}
            bindingUsages={bindingUsages}
            isActive={selectedTabIndex === 0}
          />
        </Tab>
        {configTabShouldRender && (
          <Tab
            key="lambda-configuration"
            id="lambda-configuration"
            title={LAMBDA_DETAILS.TABS.CONFIGURATION.TITLE}
          >
            <ApiRules lambda={lambda} isActive={selectedTabIndex === 1} />
            <EventSubscriptions
              isActive={selectedTabIndex === 1}
              lambda={lambda}
            />
            <ServiceBindings
              lambda={lambda}
              isActive={selectedTabIndex === 1}
              setBindingUsages={setBindingUsages}
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
