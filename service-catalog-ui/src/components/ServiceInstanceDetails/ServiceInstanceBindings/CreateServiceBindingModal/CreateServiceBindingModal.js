import React, { useState } from 'react';

import { Button, Alert } from 'fundamental-react';
import { Spinner, Tooltip, useGetList, ModalWithForm } from 'react-shared';

// import ModalWithForm from 'react-shared';
import CreateServiceBindingForm from './CreateServiceBindingForm';
import { SERVICE_BINDINGS_PANEL } from '../constants';

export default function CreateServiceBindingModal({
  serviceInstance,
  serviceBindings,
}) {
  // const [popupModalMessage, setPopupModalMessage] = useState('');

  // const serviceInstancesAlreadyUsed = serviceBindingsCombined.map(
  //   ({ serviceBinding, serviceBindingUsage }) =>
  //     serviceBindingUsage && serviceBinding?.spec.instanceRef.name,
  // );

  // const isNotAlreadyUsed = serviceInstance =>
  //   !serviceInstancesAlreadyUsed.includes(serviceInstance.metadata.name);

  const {
    loading = true,
    error,
    data: usageKinds,
    silentRefetch: refetchUsageKinds,
  } = useGetList()(
    '/apis/servicecatalog.kyma-project.io/v1alpha1/usagekinds',
    {},
  );

  const button = (
    <Button glyph="add" option="light" disabled={!usageKinds}>
      {SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON.TEXT}
    </Button>
  );
  const modalOpeningComponent = usageKinds ? (
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
      <CreateServiceBindingForm
        {...props}
        serviceInstance={serviceInstance}
        usageKinds={usageKinds}
        // setPopupModalMessage={setPopupModalMessage}
        serviceBindings={serviceBindings}

        // refetchServiceInstances={refetchUsageKinds}
      />
    </div>
  );

  return (
    <ModalWithForm
      title={SERVICE_BINDINGS_PANEL.CREATE_MODAL.TITLE}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.TEXT}
      // invalidPopupMessage={popupModalMessage}
      id="create-service-binding-modal"
      renderForm={renderForm}
    />
  );
}
