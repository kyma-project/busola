import React, { useState } from 'react';

import { Button } from 'fundamental-react';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

import CreateServiceBindingUsageForm from './CreateServiceBindingUsageForm';
import { SERVICE_BINDINGS_PANEL } from '../constants';

export default function CreateServiceBindingUsageModal({
  serviceInstance,
  serviceBindings,
  i18n,
}) {
  const { features } = useMicrofrontendContext();
  const btpCatalogEnabled =
    features.BTP_CATALOG?.isEnabled &&
    features.SERVICE_CATALOG_READ_ONLY?.isReadOnly;
  const [popupModalMessage, setPopupModalMessage] = useState(null);
  const { data: usageKinds } = useGetList()(
    '/apis/servicecatalog.kyma-project.io/v1alpha1/usagekinds',
    {},
  );
  const shouldButtonBeDisabled =
    !usageKinds ||
    serviceInstance.status.lastConditionState !== 'Ready' ||
    btpCatalogEnabled;

  const button = (
    <Button glyph="add" option="transparent" disabled={shouldButtonBeDisabled}>
      {SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON.TEXT}
    </Button>
  );

  const getTooltipContent = () => {
    if (btpCatalogEnabled) {
      return 'Service Catalog is in readonly mode.';
    }
    return !usageKinds
      ? SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON.NO_ENTRIES_POPUP_MESSAGE
      : SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON.NOT_READY_POPUP_MESSAGE;
  };

  const modalOpeningComponent = shouldButtonBeDisabled ? (
    <Tooltip
      content={getTooltipContent()}
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
      <CreateServiceBindingUsageForm
        {...props}
        serviceInstance={serviceInstance}
        usageKinds={usageKinds}
        serviceBindings={serviceBindings}
        setPopupModalMessage={setPopupModalMessage}
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
      invalidPopupMessage={popupModalMessage}
      i18n={i18n}
    />
  );
}
