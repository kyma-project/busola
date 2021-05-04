import React from 'react';
import {
  Spinner,
  useGetList,
  useGet,
  useMicrofrontendContext,
  ResourceNotFound,
} from 'react-shared';

import { sortByDisplayName } from 'helpers/sorting';
import ServiceCatalogDetails from './ServiceClassDetails';

export const ServiceClassDetailsContainer = ({ name }) => {
  const RESOURCE_TYPE_LOWERCASE = `serviceClass`;
  const { namespaceId } = useMicrofrontendContext();

  const serviceClassUrl = `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceclasses/${name}`;

  const { data: serviceClass, loading = true, error } = useGet(
    serviceClassUrl,
    {
      pollingInterval: 3000,
    },
  );

  const label =
    serviceClass?.metadata.labels['servicecatalog.k8s.io/spec.externalID'];
  const labelSelector = `?labelSelector=servicecatalog.k8s.io/spec.${RESOURCE_TYPE_LOWERCASE}Ref.name%3D${label}`;
  const { data: serviceInstances } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceinstances${labelSelector}`,
    {
      pollingInterval: 3200,
    },
  );

  const servicePlansRequest = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceplans${labelSelector}`,
  );
  const servicePlans = servicePlansRequest.data?.sort(sortByDisplayName);

  if (error) {
    return (
      <ResourceNotFound
        resource="Service Class"
        breadcrumb="Catalog"
        path="/"
        fromClosestContext={true}
      />
    );
  }

  if (loading || !serviceClass) return <Spinner />;

  return (
    <ServiceCatalogDetails
      serviceClass={serviceClass}
      serviceInstances={serviceInstances}
      servicePlans={servicePlans}
    />
  );
};

export const ClusterServiceClassDetailsContainer = ({ name }) => {
  const RESOURCE_TYPE_LOWERCASE = `clusterServiceClass`;
  const { namespaceId } = useMicrofrontendContext();

  const { data: serviceClass, loading = true, error } = useGet(
    `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceclasses/${name}`,
    {
      pollingInterval: 3000,
    },
  );

  const label =
    serviceClass?.metadata.labels['servicecatalog.k8s.io/spec.externalID'];
  const labelSelector = `?labelSelector=servicecatalog.k8s.io/spec.${RESOURCE_TYPE_LOWERCASE}Ref.name%3D${label}`;

  const { data: serviceInstances } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceinstances${labelSelector}`,
    {
      pollingInterval: 3200,
    },
  );

  const servicePlansRequest = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceplans${labelSelector}`,
  );
  const servicePlans = servicePlansRequest.data?.sort(sortByDisplayName);

  if (error) {
    return (
      <ResourceNotFound
        resource="Cluster Service Class"
        breadcrumb="Catalog"
        path="/"
        fromClosestContext={true}
      />
    );
  }

  if (loading || !serviceClass) return <Spinner />;

  return (
    <ServiceCatalogDetails
      serviceClass={serviceClass}
      serviceInstances={serviceInstances}
      servicePlans={servicePlans}
    />
  );
};
