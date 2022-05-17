import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { ExternalLink } from 'shared/components/Link/ExternalLink';
import { Trans } from 'react-i18next';
import { instancesTabUtils } from 'helpers/instances-tab-utils';
import { Tab } from 'shared/components/Tabs/Tab';
import { Tabs } from 'shared/components/Tabs/Tabs';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { InfoLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { serviceClassConstants } from 'helpers/constants';
import { determineDisplayedItems } from 'helpers/search';

import Cards from './Cards/Cards.component';

import {
  ServiceClassListWrapper,
  CardsWrapper,
  ServiceClassDescription,
  EmptyList,
  StatusWrapper,
  StatusesList,
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
        <InfoLabel className="fd-has-font-size-large" numeric data-e2e-id={id}>
          {data}
        </InfoLabel>
      </StatusWrapper>
    </StatusesList>
  );
};

const actions = (serviceClassesExists, searchQuery, searchFn) => {
  return serviceClassesExists ? (
    <FormInput
      value={searchQuery}
      type="text"
      placeholder="Search"
      onChange={e => searchFn(e.target.value)}
      data-e2e-id="search"
    />
  ) : null;
};

export default function ServiceClassList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { namespaceId } = useMicrofrontendContext();
  const { t } = useTranslation();

  const serviceClassesRequest = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceclasses`,
    {
      pollingInterval: 3100,
    },
  );
  const clusterServiceClassesRequest = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceclasses`,
    {
      pollingInterval: 2900,
    },
  );

  const serviceInstancesRequest = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceinstances`,
    {
      pollingInterval: 3300,
    },
  );

  if (serviceClassesRequest.error || clusterServiceClassesRequest.error)
    return (
      <EmptyList>{serviceClassConstants.errorServiceClassesList}</EmptyList>
    );

  if (
    serviceClassesRequest.loading ||
    clusterServiceClassesRequest.loading ||
    !serviceClassesRequest.data ||
    !clusterServiceClassesRequest.data
  )
    return (
      <EmptyList>
        <Spinner />
      </EmptyList>
    );

  const allServiceClasses = [
    ...serviceClassesRequest.data,
    ...clusterServiceClassesRequest.data,
  ];

  const [filteredServices, filteredAddons] = determineDisplayedItems(
    allServiceClasses,
    searchQuery,
  );

  const description = (
    <Trans i18nKey="catalog.description">
      <ExternalLink
        className="fd-link"
        url="https://kyma-project-docs-preview.netlify.app/components/service-catalog"
      />
    </Trans>
  );

  return (
    <>
      <PageHeader
        title={t('catalog.title')}
        description={description}
        isCatalog={true}
        actions={actions(
          allServiceClasses.length > 0,
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
          status={status(filteredServices.length, 'services-status')}
          title={
            <Tooltip content={serviceClassConstants.servicesTooltipDescription}>
              {serviceClassConstants.services}
            </Tooltip>
          }
        >
          <>
            <ServiceClassDescription>
              {t('catalog.subtitle')}
            </ServiceClassDescription>
            <ServiceClassListWrapper>
              <CardsWrapper data-e2e-id="cards">
                <Cards
                  data-e2e-id="cards"
                  items={filteredServices}
                  serviceInstances={serviceInstancesRequest.data}
                />
              </CardsWrapper>
            </ServiceClassListWrapper>
          </>
        </Tab>
        <Tab
          status={status(filteredAddons.length, 'addons-status')}
          title={
            <Tooltip content={serviceClassConstants.addonsTooltipDescription}>
              {serviceClassConstants.addons}
            </Tooltip>
          }
        >
          <>
            <ServiceClassDescription>
              {serviceClassConstants.addonsDescription}
            </ServiceClassDescription>
            <ServiceClassListWrapper>
              <CardsWrapper data-e2e-id="cards">
                <Cards
                  data-e2e-id="cards"
                  items={filteredAddons}
                  serviceInstances={serviceInstancesRequest.data}
                />
              </CardsWrapper>
            </ServiceClassListWrapper>
          </>
        </Tab>
      </Tabs>
    </>
  );
}
