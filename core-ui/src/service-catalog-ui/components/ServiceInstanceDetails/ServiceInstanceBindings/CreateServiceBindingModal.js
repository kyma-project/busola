import React from 'react';
import { Button } from 'fundamental-react';
import {
  usePost,
  ModalWithForm,
  useMicrofrontendContext,
  Tooltip,
  useNotification,
} from 'react-shared';
import { SERVICE_BINDINGS_PANEL } from './constants';
import { CreateServiceBindingForm } from './CreateServiceBindingForm';

export function CreateServiceBindingModal({ serviceInstance }) {
  const postRequest = usePost();
  const { features } = useMicrofrontendContext();
  const btpCatalogEnabled =
    features.BTP_CATALOG?.isEnabled &&
    features.SERVICE_CATALOG_READ_ONLY?.isReadOnly;
  const notification = useNotification();

  const { name: instanceRefName, namespace } = serviceInstance.metadata;

  const shouldButtonBeDisabled =
    serviceInstance.status.lastConditionState !== 'Ready' || btpCatalogEnabled;

  const getTooltipContent = () => {
    if (btpCatalogEnabled) {
      return 'Service Catalog is in readonly mode.';
    }
    return SERVICE_BINDINGS_PANEL.CREATE_MODAL.OPEN_BUTTON
      .NOT_READY_POPUP_MESSAGE;
  };

  const button = (
    <Button glyph="add" option="transparent" disabled={shouldButtonBeDisabled}>
      Add Service Binding
    </Button>
  );

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

  const create = async (name, secretName) => {
    try {
      await postRequest(
        `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespace}/servicebindings/${name}`,
        {
          apiVersion: 'servicecatalog.k8s.io/v1beta1',
          kind: 'ServiceBinding',
          metadata: {
            name,
            namespace,
          },
          spec: {
            secretName,
            instanceRef: {
              name: instanceRefName,
            },
          },
        },
      );
      notification.notifySuccess({
        content: 'Service Binding created',
      });
    } catch (e) {
      console.warn(e);
      notification.notifyError({
        title: 'Cannot create Service Binding',
        content: 'Error: ' + e.message,
      });
    }
  };

  return (
    <ModalWithForm
      title="Create Service Binding"
      modalOpeningComponent={modalOpeningComponent}
      confirmText="Create"
      renderForm={props => (
        <CreateServiceBindingForm
          {...props}
          namespace={namespace}
          handleFormSubmit={create}
        />
      )}
    />
  );
}
