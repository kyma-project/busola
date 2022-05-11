import React from 'react';
import {
  Button,
  FormLabel,
  FormFieldset,
  ComboboxInput,
} from 'fundamental-react';
import { Modal } from 'shared/components/Modal/Modal';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import './CreateBindingModal.scss';
import { BindableServicesList } from '../BindableServicesList';
import { createApplicationBinding } from './createApplicationBinding';
import { useTranslation } from 'react-i18next';

export default function CreateBinding({ application, alreadyBoundNamespaces }) {
  const { t, i18n } = useTranslation();

  const hiddenNamespaces =
    useMicrofrontendContext().features?.HIDDEN_NAMESPACES?.selectors || [];
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
      {t('applications.buttons.create')}
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
      notification.notifySuccess({
        content: t('applications.messages.binding-created'),
      });
    } catch (e) {
      console.warn(e);
      notification.notifyError({
        title: t('applications.messages.binding-create-failed'),
        content: e.message,
      });
    }
  }

  const namespaceNames = data
    ?.map(n => n.metadata.name)
    .filter(name => !alreadyBoundNamespaces.includes(name))
    .filter(name => !hiddenNamespaces || !hiddenNamespaces.includes(name));

  return (
    <Modal
      confirmText={t('common.buttons.create')}
      cancelText={t('common.buttons.cancel')}
      title={t('applications.subtitle.create-binding')}
      modalOpeningComponent={modalOpeningComponent}
      onConfirm={createBinding}
      disabledConfirm={!namespaceName}
      onHide={() => setNamespaceName('')}
      i18n={i18n}
    >
      {error && error.message}
      {loading && t('common.headers.loading')}
      {data && (
        <FormFieldset>
          <FormLabel required>{t('applications.labels.namespace')}</FormLabel>
          <ComboboxInput
            showAllEntries
            searchFullString
            id="namespace-bindings-combobox"
            ariaLabel={t('applications.aria.namespace')}
            placeholder={t('applications.labels.namespace')}
            className="namespace-combobox"
            noMatchesText={t('applications.messages.no-matches-text')}
            options={namespaceNames.map(name => ({
              key: name,
              text: name,
            }))}
            arrowLabel={t('applications.messages.show-namespaces')}
            selectionType="manual"
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
