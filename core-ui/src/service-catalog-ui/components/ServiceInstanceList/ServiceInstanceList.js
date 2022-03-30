import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';
import { Trans } from 'react-i18next';

import { Tab } from 'shared/components/Tabs/Tab';
import { Tabs } from 'shared/components/Tabs/Tabs';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { InfoLabel, FormInput } from 'fundamental-react';

import { instancesTabUtils } from 'helpers/instances-tab-utils';
import { serviceInstanceConstants } from 'helpers/constants';
import { determineDisplayedInstances } from 'helpers/search';

import ServiceInstanceTable from './ServiceInstanceTable/ServiceInstanceTable';

import {
  EmptyList,
  ServiceInstancesWrapper,
  StatusesList,
  StatusWrapper,
} from './styled';

const determineSelectedTab = () => {
  const selectedTabName = LuigiClient.getNodeParams().selectedTab;
  return instancesTabUtils.convertTabNameToIndex(selectedTabName);
};

const handleTabChange = activeTabIndex => {
  const selectedTabName = instancesTabUtils.convertIndexToTabName(
    activeTabIndex,
  );

  LuigiClient.linkManager()
    .withParams({ selectedTab: selectedTabName })
    .navigate('');
};

const status = (data, id) => {
  return (
    <StatusesList style={{ display: 'inline' }} key={id}>
      <StatusWrapper>
        <InfoLabel data-e2e-id={id}>{data}</InfoLabel>
      </StatusWrapper>
    </StatusesList>
  );
};

const actions = (serviceInstancesExists, searchQuery, searchFn) => {
  return serviceInstancesExists ? (
    <FormInput
      value={searchQuery}
      type="text"
      placeholder="Search"
      onChange={e => searchFn(e.target.value)}
      data-e2e-id="search"
    />
  ) : null;
};

export default function ServiceInstancesList() {
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { namespaceId } = useMicrofrontendContext();
  const sendDeleteRequest = useDelete();

  const { loading, error, data: serviceInstances } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceinstances`,
    {
      pollingInterval: 3100,
    },
  );

  if (loading)
    return (
      <EmptyList>
        <Spinner />
      </EmptyList>
    );

  if (error || !serviceInstances)
    return (
      <EmptyList>
        An error occurred while loading Service Instances List
      </EmptyList>
    );

  const handleDelete = instanceName => {
    return sendDeleteRequest(
      `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceinstances/${instanceName}`,
    );
  };

  const description = (
    <Trans i18nKey="instances.description">
      <Link
        className="fd-link"
        url="https://github.com/SAP/sap-btp-service-operator#step-1-create-a-service-instance"
      />
    </Trans>
  );

  return (
    <>
      <PageHeader
        title={serviceInstanceConstants.title}
        description={description}
        isCatalog={true}
        actions={actions(
          serviceInstances.length > 0,
          searchQuery,
          setSearchQuery,
        )}
      />
      <Tabs
        defaultActiveTabIndex={determineSelectedTab()}
        callback={handleTabChange}
        className="header-styles"
      >
        <Tab
          status={status(
            determineDisplayedInstances(
              serviceInstances,
              serviceInstanceConstants.servicesIndex,
              searchQuery,
            ).length,
            'services-status',
          )}
          title={
            <Tooltip
              content={serviceInstanceConstants.servicesTooltipDescription}
            >
              {serviceInstanceConstants.services}
            </Tooltip>
          }
        >
          <ServiceInstancesWrapper data-e2e-id="instances-wrapper">
            <ServiceInstanceTable
              data={determineDisplayedInstances(
                serviceInstances,
                serviceInstanceConstants.servicesIndex,
                searchQuery,
              )}
              deleteServiceInstance={handleDelete}
              type="services"
              i18n={i18n}
            />
          </ServiceInstancesWrapper>
        </Tab>
        <Tab
          status={status(
            determineDisplayedInstances(
              serviceInstances,
              serviceInstanceConstants.addonsIndex,
              searchQuery,
            ).length,
            'addons-status',
          )}
          title={
            <Tooltip
              content={serviceInstanceConstants.addonsTooltipDescription}
            >
              {serviceInstanceConstants.addons}
            </Tooltip>
          }
        >
          <ServiceInstancesWrapper data-e2e-id="instances-wrapper">
            <ServiceInstanceTable
              data={determineDisplayedInstances(
                serviceInstances,
                serviceInstanceConstants.addonsIndex,
                searchQuery,
              )}
              deleteServiceInstance={handleDelete}
              type="addons"
              i18n={i18n}
            />
          </ServiceInstancesWrapper>
        </Tab>
      </Tabs>
    </>
  );
}
