import React, { useState } from 'react';

import { Button, MessageStrip } from 'fundamental-react';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

import CreateServiceBindingForm from './CreateServiceBindingForm';
import { SERVICE_BINDINGS_PANEL } from 'components/Functions/constants';

export default function CreateServiceBindingModal({
  func,
  serviceBindingsCombined,
  i18n,
}) {
  const [popupModalMessage, setPopupModalMessage] = useState('');
  const [disablePolling, setDisablePolling] = useState(true);

  const serviceInstancesAlreadyUsed = serviceBindingsCombined.map(
    ({ serviceBinding, serviceBindingUsage }) =>
      serviceBindingUsage && serviceBinding?.spec.instanceRef.name,
  );
  const isNotAlreadyUsed = serviceInstance =>
    !serviceInstancesAlreadyUsed.includes(serviceInstance.metadata.name);

  const {
    loading = true,
    error,
    data: serviceInstances,
    silentRefetch: refetchServiceInstances,
  } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${func.metadata.namespace}/serviceinstances`,
    {
      pollingInterval: disablePolling ? 0 : 5500,
      skip: false,
    },
  );
  const { data: servicePlans } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${func.metadata.namespace}/serviceplans`,
    {
      pollingInterval: disablePolling ? 0 : 6000,
      skip: false,
    },
  );

  const { data: clusterServicePlans } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceplans`,
    {
      pollingInterval: disablePolling ? 0 : 6500,
      skip: false,
    },
  );

  const { data: serviceClasses } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${func.metadata.namespace}/serviceclasses`,
    {
      pollingInterval: disablePolling ? 0 : 7000,
      skip: false,
    },
  );

  const { data: clusterServiceclasses } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceclasses`,
    {
      pollingInterval: 7500,
    },
  );

  const getInstancesWithBindableData = instance => {
    const planRefFieldName = instance.spec.clusterServicePlanRef
      ? 'clusterServicePlanRef'
      : instance.spec.servicePlanRef
      ? 'servicePlanRef'
      : null;
    const plans = instance.spec.clusterServicePlanRef
      ? clusterServicePlans
      : servicePlans;

    const plan =
      plans?.find(p =>
        planRefFieldName
          ? p.metadata.name === instance.spec[planRefFieldName].name
          : false,
      ) || {};

    const classRefFieldName = instance.spec.clusterServiceClassRef
      ? 'clusterServiceClassRef'
      : instance.spec.serviceClassRef
      ? 'serviceClassRef'
      : null;
    const classes = instance.spec.clusterServiceClassRef
      ? clusterServiceclasses
      : serviceClasses;

    const serviceClass =
      classes?.find(p =>
        classRefFieldName
          ? p.metadata.name === instance.spec[classRefFieldName].name
          : false,
      ) || {};
    return {
      ...instance,
      isBindable: plan?.spec?.bindable || serviceClass?.spec?.bindable || false,
    };
  };
  const instancesWithBindableData =
    serviceInstances?.map(getInstancesWithBindableData) || [];

  const instancesBindable =
    instancesWithBindableData.filter(
      serviceInstance => serviceInstance.isBindable,
    ) || [];

  const instancesNotBound = instancesBindable?.filter(isNotAlreadyUsed) || [];

  const hasAnyInstances = !!instancesNotBound.length;

  let fallbackContent = null;
  if (error) {
    fallbackContent = (
      <MessageStrip dismissible={false} type="error">
        {error.message}
      </MessageStrip>
    );
  }
  if (!fallbackContent && loading) {
    fallbackContent = <Spinner />;
  }

  const { features } = useMicrofrontendContext();
  const btpCatalogEnabled =
    features.BTP_CATALOG?.isEnabled &&
    features.SERVICE_CATALOG_READ_ONLY?.isReadOnly;

  const button = (
    <Button
      glyph="add"
      option="transparent"
      disabled={!hasAnyInstances || btpCatalogEnabled}
    >
      {SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON.TEXT}
    </Button>
  );
  const modalOpeningComponent = hasAnyInstances ? (
    btpCatalogEnabled ? (
      <Tooltip
        content="Service Catalog is in readonly mode."
        position="top"
        trigger="mouseenter"
        tippyProps={{
          distance: 16,
        }}
      >
        {button}
      </Tooltip>
    ) : (
      button
    )
  ) : (
    <Tooltip
      content={
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON
          .NOT_ENTRIES_POPUP_MESSAGE
      }
      position="top"
      trigger="mouseenter"
      tippyProps={{
        distance: 16,
      }}
    >
      {button}
    </Tooltip>
  );

  const renderForm = props => (
    <div className="create-service-binding-modal">
      {fallbackContent || (
        <CreateServiceBindingForm
          {...props}
          func={func}
          availableServiceInstances={instancesNotBound}
          setPopupModalMessage={setPopupModalMessage}
          serviceBindings={serviceBindingsCombined.map(
            ({ serviceBinding }) => serviceBinding,
          )}
          refetchServiceInstances={refetchServiceInstances}
        />
      )}
    </div>
  );

  return (
    <ModalWithForm
      onModalOpenStateChange={isOpen => setDisablePolling(!isOpen)}
      title={SERVICE_BINDINGS_PANEL.CREATE_MODAL.TITLE}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.TEXT}
      invalidPopupMessage={popupModalMessage}
      id="create-service-binding-modal"
      renderForm={renderForm}
      i18n={i18n}
    />
  );
}
