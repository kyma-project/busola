import React from 'react';
import {
  Button,
  FormLabel,
  FormFieldset,
  ComboboxInput,
} from 'fundamental-react';
import {
  Modal,
  useGetList,
  usePost,
  useMicrofrontendContext,
  useNotification,
} from 'react-shared';
import './CreateBindingModal.scss';
import { BindableServicesList } from '../BindableServicesList';
import { createApplicationBinding } from './createApplicationBinding';

export default function CreateBindingModal({
  application,
  alreadyBoundNamespaces,
}) {
  const { hiddenNamespaces } = useMicrofrontendContext();
  const [servicesToBind, setServicesToBind] = React.useState([]);
  const [namespaceName, setNamespaceName] = React.useState('');
  const notification = useNotification();

  const postRequest = usePost();

  const { data, loading, error } = useGetList(() => true)(
    '/api/v1/namespaces',
    {},
  );

  const modalOpeningComponent = (
    <Button glyph="add" option="transparent">
      Create Binding
    </Button>
  );

  async function createBinding() {
    const applicationBinding = createApplicationBinding(
      application,
      namespaceName,
      servicesToBind,
    );
    try {
      await postRequest(
        `/apis/applicationconnector.kyma-project.io/v1alpha1/namespaces/${namespaceName}/applicationmappings`,
        applicationBinding,
      );
      notification.notifySuccess({ content: 'Binding created' });
    } catch (e) {
      console.warn(e);
      notification.notifyError({
        title: 'Failed to create the Binding',
        content: e.message,
      });
    }
  }

  const namespaceNames = data
    ?.map(n => n.metadata.name)
    .filter(name => !alreadyBoundNamespaces.includes(name))
    .filter(name =>
      hiddenNamespaces ? !hiddenNamespaces.includes(name) : true,
    );

  return (
    <Modal
      confirmText="Create"
      cancelText="Cancel"
      title="Create Namespace Binding"
      modalOpeningComponent={modalOpeningComponent}
      onConfirm={createBinding}
      disabledConfirm={!namespaceName}
      onHide={() => setNamespaceName('')}
    >
      {error && error.message}
      {loading && 'Loading...'}
      {data && (
        <FormFieldset>
          <FormLabel required>Namespace</FormLabel>
          <ComboboxInput
            id="namespace-bindings-combobox"
            ariaLabel="Choose namespace"
            placeholder="Choose namespace..."
            className="namespace-combobox"
            noMatchesText="No Namespaces to bind"
            options={namespaceNames.map(name => ({
              key: name,
              text: name,
            }))}
            arrowLabel="Show namespaces"
            selectionType="auto-inline"
            onSelectionChange={(_, selected) =>
              setNamespaceName(
                typeof selected.key === 'string' ? selected.key : undefined,
              )
            }
          />
          <BindableServicesList
            services={[]}
            availableServices={application.spec.services}
            setServices={setServicesToBind}
          />
        </FormFieldset>
      )}
    </Modal>
  );
}
