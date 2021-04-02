import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Button } from 'fundamental-react';
import {
  Tooltip,
  Spinner,
  ModalWithForm,
  useGetList,
  useGet,
  useMicrofrontendContext,
  ResourceNotFound,
} from 'react-shared';

import './ServiceClassDetails.scss';
import { getResourceDisplayName, isStringValueEqualToTrue } from 'helpers';
import {
  createInstanceConstants,
  DOCUMENTATION_PER_PLAN_LABEL,
} from 'helpers/constants';
import CreateInstanceForm from './CreateInstanceForm/CreateInstanceForm';
import ServiceClassDetailsHeader from './ServiceClassDetailsHeader/ServiceClassDetailsHeader';
import ServiceClassInstancesTable from './ServiceClassInstancesTable/ServiceClassInstancesTable';
import ServiceClassPlansList from 'components/ServiceClassPlansList/ServiceClassPlansList';
import { sortByDisplayName } from 'helpers/sorting';
import PlanSelector from './PlanSelector/PlanSelector';

export default function ServiceClassDetails({ name }) {
  const { namespaceId } = useMicrofrontendContext();
  const { resourceType } = LuigiClient.getNodeParams();
  const { planId } = LuigiClient.getPathParams();

  const serviceClassUrl = `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceclasses/${name}`;
  const clusterServiceClassUrl = `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceclasses/${name}`;
  const { data: serviceClass, loading = true, error } = useGet(
    resourceType === 'ClusterServiceClass'
      ? clusterServiceClassUrl
      : serviceClassUrl,
    {
      pollingInterval: 3000,
    },
  );

  const resourceTypeLowercase =
    resourceType?.charAt(0).toLowerCase() + resourceType?.slice(1);
  const label =
    serviceClass?.metadata.labels['servicecatalog.k8s.io/spec.externalID'];
  const labelSelector = `?labelSelector=servicecatalog.k8s.io/spec.${resourceTypeLowercase}Ref.name%3D${label}`;
  const { data: serviceInstances } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceinstances${labelSelector}`,
    {
      pollingInterval: 3200,
    },
  );

  const servicePlansUrl = `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceplans${labelSelector}`;
  const clusterServicePlansUrl = `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceplans${labelSelector}`;
  const plansUrl =
    resourceType === 'ClusterServiceClass'
      ? clusterServicePlansUrl
      : servicePlansUrl;
  const servicePlansRequest = useGetList()(plansUrl, {});
  const servicePlans = servicePlansRequest.data?.sort(sortByDisplayName);

  if (error) {
    return (
      <ResourceNotFound
        resource={resourceType}
        breadcrumb="Catalog"
        path="/"
        fromClosestContext={true}
      />
    );
  }

  if (loading || !serviceClass) {
    return <Spinner />;
  }

  const documentationPerPlan =
    serviceClass.spec.externalMetadata?.labels &&
    isStringValueEqualToTrue(
      serviceClass.spec.externalMetadata?.labels[DOCUMENTATION_PER_PLAN_LABEL],
    );

  if (!planId && documentationPerPlan && servicePlans && servicePlans.length) {
    if (servicePlans.length > 1)
      return (
        <ServiceClassPlansList
          plans={servicePlans}
          serviceClass={serviceClass}
        />
      );
    else {
      LuigiClient.linkManager()
        .fromClosestContext()
        .withParams({
          resourceType,
        })
        .navigate(
          `details/${serviceClass.metadata.name}/plan/${servicePlans[0].metadata.name}`,
        );
      return null;
    }
  }

  const serviceClassDisplayName = getResourceDisplayName(serviceClass);
  const isActivated = serviceInstances?.length > 0;
  const isAPIpackage =
    serviceClass.spec.externalMetadata?.labels &&
    isStringValueEqualToTrue(
      serviceClass.spec.externalMetadata.labels[DOCUMENTATION_PER_PLAN_LABEL],
    );
  const isProvisionedOnlyOnce =
    serviceClass.spec.externalMetadata?.labels &&
    isStringValueEqualToTrue(
      serviceClass.spec.externalMetadata.labels.provisionOnlyOnce,
    );

  const modalOpeningComponent = (
    <Tooltip content={createInstanceConstants.provisionOnlyOnceInfo}>
      <Button disabled={isProvisionedOnlyOnce && isActivated} glyph="add">
        {isProvisionedOnlyOnce
          ? isActivated
            ? createInstanceConstants.buttonText.provisionOnlyOnceActive
            : createInstanceConstants.buttonText.provisionOnlyOnce
          : createInstanceConstants.buttonText.standard}
      </Button>
    </Tooltip>
  );

  return (
    <>
      <ServiceClassDetailsHeader
        serviceClass={serviceClass}
        planSelector={
          isAPIpackage && (
            <PlanSelector
              allPlans={servicePlans}
              serviceClassName={serviceClass.metadata.name}
              serviceClassKind={serviceClass.kind}
              currentlySelected={planId}
            />
          )
        }
      >
        <ModalWithForm
          title={`Provision the ${serviceClassDisplayName}${' '}
                  ${
                    resourceType === 'ClusterServiceClass'
                      ? 'Cluster Service Class'
                      : 'Service Class'
                  }${' '}
                  in the ${namespaceId} Namespace`}
          modalOpeningComponent={modalOpeningComponent}
          id="add-instance-modal"
          item={serviceClass}
          renderForm={props => (
            <CreateInstanceForm
              {...props}
              plans={servicePlans || []}
              documentationUrl={
                serviceClass.spec.externalMetadata?.documentationUrl
              }
              preselectedPlanName={isAPIpackage && planId}
            />
          )}
        />
      </ServiceClassDetailsHeader>
      <ServiceClassInstancesTable instanceList={serviceInstances} />
    </>
  );
}
