import React, { useState } from 'react';

import { Button, MessageStrip } from 'fundamental-react';
import { Spinner, Tooltip, useGetList } from 'react-shared';

import { ModalWithForm } from 'react-shared';
import CreateServiceBindingForm from './CreateServiceBindingForm';
import { SERVICE_BINDINGS_PANEL } from 'components/Lambdas/constants';

export default function CreateServiceBindingModal({
  lambda,
  serviceBindingsCombined,
}) {
  const [popupModalMessage, setPopupModalMessage] = useState('');

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
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${lambda.metadata.namespace}/serviceinstances`,
    {
      pollingInterval: 5500,
    },
  );
  const { data: servicePlans } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${lambda.metadata.namespace}/serviceplans`,
    {
      pollingInterval: 6000,
    },
  );

  const { data: clusterServicePlans } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceplans`,
    {
      pollingInterval: 6500,
    },
  );

  const { data: serviceClasses } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${lambda.metadata.namespace}/serviceclasses`,
    {
      pollingInterval: 7000,
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

  const button = (
    <Button glyph="add" option="transparent" disabled={!hasAnyInstances}>
      {SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON.TEXT}
    </Button>
  );
  const modalOpeningComponent = hasAnyInstances ? (
    button
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
          lambda={lambda}
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
      title={SERVICE_BINDINGS_PANEL.CREATE_MODAL.TITLE}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.TEXT}
      invalidPopupMessage={popupModalMessage}
      id="create-service-binding-modal"
      renderForm={renderForm}
    />
  );
}
