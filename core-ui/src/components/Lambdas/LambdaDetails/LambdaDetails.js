import React, { useState } from 'react';
import { TabGroup, Tab } from 'fundamental-react';

import CodeTab from './Tabs/Code/CodeTab';
import ResourceManagementTab from './Tabs/ResourceManagement/ResourceManagementTab';

import EventSubscriptionsWrapper from './Tabs/Configuration/EventSubscriptions/EventSubscriptionsWrapper';
import ServiceBindingsWrapper from './Tabs/Configuration/ServiceBindings/ServiceBindingsWrapper';
import ApiRules from './Tabs/Configuration/ApiRules/ApiRules';

// import { useLogsView } from '../helpers/misc';

import { LAMBDA_DETAILS } from 'components/Lambdas/constants';
import { CRDS, crdsExist } from 'components/Lambdas/helpers/misc';

export default function LambdaDetails({ lambda, crds = [] }) {
  const [bindingUsages, setBindingUsages] = useState([]);
  // useLogsView(lambda.UID, lambda.namespace);

  const apiRules = crdsExist(crds, [CRDS.API_GATEWAY]) ? (
    <ApiRules lambda={lambda} />
  ) : null;

  const eventSubscriptions = crdsExist(crds, [CRDS.EVENTING]) ? (
    <EventSubscriptionsWrapper lambda={lambda} />
  ) : null;

  const serviceBindings = crdsExist(crds, [
    CRDS.SERVICE_CATALOG,
    CRDS.SERVICE_CATALOG_ADDONS,
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
      <TabGroup className="lambda-details-tabs">
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
      </TabGroup>
    </>
  );
}
