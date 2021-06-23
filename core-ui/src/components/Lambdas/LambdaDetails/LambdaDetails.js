import React, { useState } from 'react';
import { useMicrofrontendContext, modulesExist, Tabs, Tab } from 'react-shared';

import CodeTab from './Tabs/Code/CodeTab';
import ResourceManagementTab from './Tabs/ResourceManagement/ResourceManagementTab';
import EventSubscriptionsWrapper from './Tabs/Configuration/EventSubscriptions/EventSubscriptionsWrapper';
import ServiceBindingsWrapper from './Tabs/Configuration/ServiceBindings/ServiceBindingsWrapper';
import ApiRules from './Tabs/Configuration/ApiRules/ApiRules';

// import { useLogsView } from '../helpers/misc';

import { LAMBDA_DETAILS } from 'components/Lambdas/constants';

export default function LambdaDetails({ lambda }) {
  const [bindingUsages, setBindingUsages] = useState([]);
  const microfrontendContext = useMicrofrontendContext();
  const { crds, modules } = microfrontendContext;
  // useLogsView(lambda.UID, lambda.namespace);

  const apiRules = modulesExist(crds, [modules?.API_GATEWAY]) ? (
    <ApiRules lambda={lambda} />
  ) : null;

  const eventSubscriptions = modulesExist(crds, [modules?.EVENTING]) ? (
    <EventSubscriptionsWrapper lambda={lambda} />
  ) : null;

  const serviceBindings = modulesExist(crds, [
    modules?.SERVICE_CATALOG,
    modules?.SERVICE_CATALOG_ADDONS,
  ]) ? (
    <ServiceBindingsWrapper
      lambda={lambda}
      setBindingUsages={setBindingUsages}
    />
  ) : null;

  const configTabShouldRender =
    apiRules || eventSubscriptions || serviceBindings;

  return (
    <>
      <Tabs className="lambda-details-tabs">
        <Tab
          key="lambda-code"
          id="lambda-code"
          title={LAMBDA_DETAILS.TABS.CODE.TITLE}
        >
          <CodeTab lambda={lambda} bindingUsages={bindingUsages} />
        </Tab>
        {configTabShouldRender && (
          <Tab
            key="lambda-configuration"
            id="lambda-configuration"
            title={LAMBDA_DETAILS.TABS.CONFIGURATION.TITLE}
          >
            {apiRules}
            {eventSubscriptions}
            {serviceBindings}
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
