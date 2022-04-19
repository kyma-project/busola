import React from 'react';

import { BindableServicesList } from './BindableServicesList';
import { Button, FormFieldset } from 'fundamental-react';
import { Modal } from 'shared/components/Modal/Modal';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { createPatch } from 'rfc6902';
import { useTranslation } from 'react-i18next';

export default function EditNamespaceBinding({ application, binding }) {
  const { t, i18n } = useTranslation();
  const namespace = binding.metadata.namespace;
  const [servicesToBind, setServicesToBind] = React.useState([]);
  const patchRequest = useUpdate();
  const modalOpeningComponent = (
    <Button compact option="transparent" glyph="edit" />
  );

  async function updateBinding() {
    const newBinding = JSON.parse(JSON.stringify(binding));
    newBinding.spec.services = application.spec.services.filter(s =>
      servicesToBind.find(svc => svc.id === s.id),
    );
    if (newBinding.spec.services.lenght === 0) newBinding.spec.services = [];

    try {
      await patchRequest(
        `/apis/applicationconnector.kyma-project.io/v1alpha1/namespaces/${namespace}/applicationmappings/${binding.metadata.name}`,
        createPatch(binding, newBinding),
      );
    } catch (e) {
      console.warn(e);
    }
  }

  return (
    <Modal
      confirmText={t('common.buttons.edit')}
      cancelText={t('common.buttons.cancel')}
      title={t('applications.subtitle.edit-binding', {
        namespace: namespace,
      })}
      modalOpeningComponent={modalOpeningComponent}
      onConfirm={updateBinding}
      onShow={() => setServicesToBind(binding.spec?.services)}
      i18n={i18n}
    >
      <FormFieldset>
        <BindableServicesList
          availableServices={application.spec.services}
          services={servicesToBind}
          setServices={setServicesToBind}
        />
      </FormFieldset>
    </Modal>
  );
}
