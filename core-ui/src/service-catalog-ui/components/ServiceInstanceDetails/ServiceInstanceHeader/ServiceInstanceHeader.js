import React from 'react';
import LuigiClient from '@luigi-project/client';
import { serviceInstanceConstants } from 'helpers/constants';
import { Button } from 'fundamental-react';
import {
  PageHeader,
  useGet,
  Spinner,
  useDelete,
  useNotification,
  useMicrofrontendContext,
  Tooltip,
} from 'react-shared';
import { isService } from 'helpers';
import ServiceserviceClassInfo from '../ServiceInstanceInfo/ServiceInstanceInfo';

const ServiceInstanceHeader = ({ serviceInstance, servicePlan, i18n }) => {
  const deleteRequest = useDelete();
  const notificationManager = useNotification();
  const { features } = useMicrofrontendContext();

  const btpCatalogEnabled =
    features.BTP_CATALOG?.isEnabled &&
    features.SERVICE_CATALOG_READ_ONLY?.isReadOnly;

  const classRef =
    serviceInstance.spec.serviceClassRef?.name ||
    serviceInstance.spec.clusterServiceClassRef?.name;

  const serviceClassUrlFragment = serviceInstance.spec
    .clusterServiceClassExternalName
    ? `clusterserviceclasses`
    : `namespaces/${serviceInstance.metadata.namespace}/serviceclasses`;

  const {
    data: serviceClass,
  } = useGet(
    `/apis/servicecatalog.k8s.io/v1beta1/${serviceClassUrlFragment}/${classRef}`,
    { skip: !classRef },
  );
  if (!serviceClass) return <Spinner />;

  const preselectTabOnList = isService(
    serviceClass.spec.externalMetadata?.labels,
  )
    ? 'services'
    : 'addons';

  async function handleInstanceDelete() {
    try {
      const { apiVersion } = serviceInstance;
      const { name, namespace } = serviceInstance.metadata;
      await deleteRequest(
        `/apis/${apiVersion}/namespaces/${namespace}/serviceinstances/${name}`,
      );
      notificationManager.notifySuccess({
        content: 'Service Instance deleted',
      });

      LuigiClient.linkManager()
        .fromContext('namespace')
        .withParams({
          selectedTab: preselectTabOnList,
        })
        .navigate('instances');
    } catch (err) {
      console.error(err);
      notificationManager.notifyError({
        title: 'Failed to delete the Service Instance',
        content: err.message,
        autoClose: false,
      });
    }
  }

  const breadcrumbItems = [
    {
      name: `${serviceInstanceConstants.instances} - ${
        isService(serviceClass.spec.externalMetadata?.labels)
          ? 'Services'
          : 'Addons'
      }`,
      params: {
        selectedTab: preselectTabOnList,
      },
      path: '/',
    },
    {
      name: '',
    },
  ];

  let actions = (
    <Button
      type="negative"
      disabled={btpCatalogEnabled}
      option="transparent"
      onClick={handleInstanceDelete}
    >
      {serviceInstanceConstants.delete}
    </Button>
  );
  if (btpCatalogEnabled) {
    actions = (
      <Tooltip content="Service Catalog is in readonly mode.">
        {actions}
      </Tooltip>
    );
  }

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      title={serviceInstance.metadata.name}
      actions={actions}
      description={serviceClass.spec.description}
    >
      <ServiceserviceClassInfo
        serviceClass={serviceClass}
        serviceInstance={serviceInstance}
        servicePlan={servicePlan}
        i18n={i18n}
      />
    </PageHeader>
  );
};

export default ServiceInstanceHeader;
