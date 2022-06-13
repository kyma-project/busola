import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { ResourceForm } from 'shared/ResourceForm';
import { Select } from 'shared/components/Select/Select';
import { useTranslation } from 'react-i18next';
import * as Inputs from 'shared/ResourceForm/inputs';
import { useUpsert } from 'shared/hooks/BackendAPI/useUpsert';
import { useNotification } from 'shared/contexts/NotificationContext';
import { createExtensibilityTemplate, createConfigmap } from './helpers';

export function ExtensibilityStarterForm({ crd, formElementRef, onChange }) {
  const { t } = useTranslation();
  const notificationManager = useNotification();
  const upsert = useUpsert();

  const [state, setState] = useState(() => createExtensibilityTemplate(crd, t));
  console.log(state);

  const { name, ...cmData } = state; //todo

  return (
    <ResourceForm.Single
      formElementRef={formElementRef}
      onChange={onChange}
      resource={state}
      setResource={setState}
      createResource={async e => {
        const onError = e =>
          notificationManager.notifyError({
            content: t('common.messages.error', { error: e.message }),
            title: t('extensibility.starter-modal.messages.error'),
            type: 'error',
          });

        const onSuccess = () => {
          notificationManager.notifySuccess({
            content: t('extensibility.starter-modal.messages.success'),
          });
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate(
              'namespaces/kube-public/configmaps/details/' + crd.metadata.name,
            );
        };

        try {
          await upsert({
            url: '/api/v1/namespaces/kube-public/configmaps',
            resource: createConfigmap(crd, cmData),
            onSuccess,
            onError,
          });
        } catch (e) {
          console.log(e);
        }
      }}
    >
      <ResourceForm.Wrapper>
        <ResourceForm.FormField
          required
          propertyPath="name"
          label={t('common.labels.name')}
          input={Inputs.Text}
        />
        <ResourceForm.FormField
          required
          propertyPath="navigation.category"
          label={t('common.labels.category')}
          input={Inputs.Text}
        />
        <ResourceForm.CollapsibleSection
          title={t('extensibility.starter-modal.headers.form')}
        >
          <ResourceForm.FormField
            required
            propertyPath='$["current-context"]'
            label={'dupa'}
            validate={value => !!value}
            input={({ value, setValue }) => (
              <Select
                selectedKey={value}
                options={[{ key: 'a', text: 'b' }]}
                onSelect={(_, { key }) => setValue(key)}
              />
            )}
          />
        </ResourceForm.CollapsibleSection>
        <ResourceForm.CollapsibleSection
          title={t('extensibility.starter-modal.headers.list')}
        ></ResourceForm.CollapsibleSection>
        <ResourceForm.CollapsibleSection
          title={t('extensibility.starter-modal.headers.details')}
        ></ResourceForm.CollapsibleSection>
      </ResourceForm.Wrapper>
    </ResourceForm.Single>
  );
}
