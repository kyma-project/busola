import React, { useState } from 'react';

import { Button, Alert } from 'fundamental-react';
import { Spinner, Tooltip, useGetList, ModalWithForm } from 'react-shared';

// import ModalWithForm from 'react-shared';
import CreateServiceBindingForm from './CreateServiceBindingForm';
import { SERVICE_BINDINGS_PANEL } from './constants';

const ResourceKindOptgroup = ({ kindResource, namespace }) => {
  const { data } = useGetList()(
    `/apis/${kindResource.group}/${kindResource.version}/namespaces/${namespace}/${kindResource.kind}s`,
    {},
  );
  return (
    <optgroup label={kindResource.kind}>
      {data && data.map(res => <option>{res.metadata.name}</option>)}
    </optgroup>
  );
};

export default function CreateServiceBindingModal({
  serviceInstance,
  serviceBindingsCombined,
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

  // return usageKinds ? (
  //   <select>
  //     {usageKinds.map(u => (
  //       <ResourceKindOptgroup
  //         kindResource={u.spec.resource}
  //         namespace={serviceInstance.metadata.namespace}
  //       />
  //     ))}
  //   </select>
  // ) : null;

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
        // availableServiceInstances={usageKinds}
        // setPopupModalMessage={setPopupModalMessage}
        serviceBindings={serviceBindingsCombined.map(
          ({ serviceBinding }) => serviceBinding,
        )}
        secrets={serviceBindingsCombined
          .map(({ secret }) => secret)
          .filter(s => s)}
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
