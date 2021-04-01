import React from 'react';

import { Button } from 'fundamental-react';
import { Tooltip, useGetList, ModalWithForm } from 'react-shared';

import CreateServiceBindingForm from './CreateServiceBindingForm';
import { SERVICE_BINDINGS_PANEL } from '../constants';

export default function CreateServiceBindingModal({
  serviceInstance,
  serviceBindings,
}) {
  const { data: usageKinds } = useGetList()(
    '/apis/servicecatalog.kyma-project.io/v1alpha1/usagekinds',
    {},
  );
  const shouldButtonBeDisabled =
    !usageKinds || serviceInstance.status.lastConditionState !== 'Ready';

  const button = (
    <Button glyph="add" option="light" disabled={shouldButtonBeDisabled}>
      {SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON.TEXT}
    </Button>
  );

  const modalOpeningComponent = shouldButtonBeDisabled ? (
    <Tooltip
      content={
        !usageKinds
          ? SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON
              .NO_ENTRIES_POPUP_MESSAGE
          : SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON
              .NOT_READY_POPUP_MESSAGE
      }
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
  );

  const renderForm = props => (
    <div className="create-service-binding-modal">
      <CreateServiceBindingForm
        {...props}
        serviceInstance={serviceInstance}
        usageKinds={usageKinds}
        serviceBindings={serviceBindings}
      />
    </div>
  );

  return (
    <ModalWithForm
      title={SERVICE_BINDINGS_PANEL.CREATE_MODAL.TITLE}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.TEXT}
      id="create-service-binding-modal"
      renderForm={renderForm}
    />
  );
}
