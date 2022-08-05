import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';

import * as Inputs from 'shared/ResourceForm/inputs';
import { useUpsert } from 'shared/hooks/BackendAPI/useUpsert';
import { useNotification } from 'shared/contexts/NotificationContext';
import { ResourceForm } from 'shared/ResourceForm';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import { createExtensibilityTemplate, createConfigmap } from './helpers';
import { ColumnsInput } from './ColumnsInput';
import './ExtensibilityStarterForm.scss';

export function BusolaExtensionCreate({ formElementRef, onChange }) {
  const { t } = useTranslation();
  const notificationManager = useNotification();
  const upsert = useUpsert();

  const { data: crds } = useGetList()(
    '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
  );
  const [crd, setCrd] = useState(null);
  const [state, setState] = useState({});

  return (
    <ResourceForm.Single
      formElementRef={formElementRef}
      onChange={onChange}
      resource={state}
      setResource={setState}
      className="resource-form--unset-height"
      createResource={async () => {
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

        const configmap = createConfigmap(crd, state);
        await upsert({
          url: '/api/v1/namespaces/kube-public/configmaps',
          resource: configmap,
          onSuccess,
          onError,
        });
      }}
    >
      <ResourceForm.Wrapper>
        <ResourceForm.FormField
          required
          label={t('extensibility.starter-modal.crd')}
          value={crd?.metadata.name}
          setValue={value => {
            const crd = crds.find(crd => crd.metadata.name === value);
            setCrd(crd);
            setState(createExtensibilityTemplate(crd, t));
          }}
          input={Inputs.ComboboxInput}
          options={(crds ?? []).map(crd => ({
            key: crd.metadata.name,
            text: crd.metadata.name,
          }))}
        />
        {crd && (
          <>
            <ResourceForm.FormField
              required
              propertyPath="$.general.name"
              label={t('common.labels.name')}
              input={Inputs.Text}
            />
            <ResourceForm.FormField
              required
              propertyPath="$.general.category"
              label={t('common.labels.category')}
              input={Inputs.Text}
            />
            <ResourceForm.CollapsibleSection
              title={t('extensibility.starter-modal.headers.form-fields')}
            >
              <ColumnsInput propertyPath="$.form" />
            </ResourceForm.CollapsibleSection>
            <ResourceForm.CollapsibleSection
              title={t('extensibility.starter-modal.headers.list-columns')}
            >
              <ColumnsInput propertyPath="$.list" />
            </ResourceForm.CollapsibleSection>
            <ResourceForm.CollapsibleSection
              title={t('extensibility.starter-modal.headers.details-summary')}
            >
              <ColumnsInput propertyPath="$.details.body[0].children" />
            </ResourceForm.CollapsibleSection>
          </>
        )}
      </ResourceForm.Wrapper>
    </ResourceForm.Single>
  );
}
