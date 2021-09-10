import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { usePost, useNotification } from 'react-shared';
import { ResourceForm } from './../ResourceForm/ResourceForm';
import { Button, Checkbox } from 'fundamental-react';
import * as jp from 'jsonpath';
import './Deployments.create.scss';

import {
  createContainerTemplate,
  createDeploymentTemplate,
  createPresets,
  createServiceTemplate,
} from './templates';
import { Containers } from './Containers';

export function DeploymentsCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const { t, i18n } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();

  const [deployment, setDeployment] = React.useState(
    createDeploymentTemplate(namespace),
  );
  const [service, setService] = React.useState(
    createServiceTemplate(namespace),
  );
  const [createService, setCreateService] = React.useState(false);

  React.useEffect(() => {
    const hasAnyContainers = !!(
      jp.value(deployment, '$.spec.template.spec.containers') || []
    ).length;

    setCustomValid(hasAnyContainers);
  }, [deployment, setCustomValid]);

  const serviceActions = (
    <Checkbox
      compact
      checked={createService}
      onChange={(_, checked) => setCreateService(checked)}
      dir="rtl"
    >
      {t('deployments.create-modal.advanced.expose-service')}
    </Checkbox>
  );

  const renderEditor = ({ defaultEditor, Editor }) => (
    <div className="double-editor">
      <ResourceForm.CollapsibleSection
        title={t('deployments.name_singular')}
        defaultOpen
      >
        {defaultEditor}
      </ResourceForm.CollapsibleSection>
      <ResourceForm.CollapsibleSection
        title={t('services.name_singular')}
        actions={serviceActions}
      >
        <Editor
          resource={service}
          setResource={setService}
          readonly={!createService}
        />
      </ResourceForm.CollapsibleSection>
    </div>
  );

  const handleNameChange = name => {
    jp.value(deployment, '$.metadata.name', name);
    jp.value(deployment, '$.spec.template.spec.containers[0].name', name);
    jp.value(deployment, '$.spec.selector.matchLabels.app', name); // match labels
    jp.value(deployment, `$.spec.template.metadata.labels.app`, name); // pod labels
    setDeployment({ ...deployment });

    jp.value(service, '$.metadata.name', name);
    jp.value(service, '$.spec.selector.app', name);
    setService({ ...service });
  };

  const onCreate = async () => {
    try {
      await postRequest(
        `/apis/apps/v1/namespaces/${namespace}/deployments/`,
        deployment,
      );
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('deployments.create-modal.messages.failure'),
        content: t('common.create-form.messages.failure', {
          resourceType: t('deployments.name_singular'),
        }),
      });
      return false;
    }
    try {
      if (createService) {
        await postRequest(`/api/v1/namespaces/${namespace}/services`, service);
      }
      notification.notifySuccess({
        content: t('common.create-form.messages.success', {
          resourceType: t('deployments.name_singular'),
        }),
      });
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/deployments/details/${deployment.metadata.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: t('deployments.create-modal.messages.deployment-ok-service-bad'),
        content: e.message,
      });
    }
  };

  return (
    <ResourceForm
      pluralKind="deployments"
      singularName={t(`deployments.name_singular`)}
      resource={deployment}
      setResource={setDeployment}
      onChange={onChange}
      formElementRef={formElementRef}
      onCreate={onCreate}
      renderEditor={renderEditor}
      presets={createPresets(namespace, t)}
      onPresetSelected={value => {
        setDeployment(value.deployment);
        setCreateService(!!value.service);
        if (value.service) {
          setService(value.service);
        }
      }}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('deployments.name_singular')}
        customOnChange={handleNameChange}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        label={t('common.headers.labels')}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        label={t('common.headers.annotations')}
      />

      <ResourceForm.FormField
        required
        simple
        propertyPath="$.spec.template.spec.containers[0].image"
        label={t('deployments.create-modal.simple.docker-image')}
        input={(value, setValue) => (
          <ResourceForm.Input
            required
            setValue={setValue}
            value={value}
            placeholder={t(
              'deployments.create-modal.simple.docker-image-placeholder',
            )}
          />
        )}
      />
      <ResourceForm.CollapsibleSection
        advanced
        title="Containers"
        defaultOpen
        resource={deployment}
        setResource={setDeployment}
        actions={
          <Button
            glyph="add"
            compact
            onClick={() => {
              const path = '$.spec.template.spec.containers';
              const nextContainers = [
                ...(jp.value(deployment, path) || []),
                createContainerTemplate(),
              ];
              jp.value(deployment, path, nextContainers);

              setDeployment({ ...deployment });
              onChange(new Event('input', { bubbles: true }));
            }}
          >
            Add Container
          </Button>
        }
      >
        <Containers propertyPath="$.spec.template.spec.containers" />
      </ResourceForm.CollapsibleSection>
      <ResourceForm.CollapsibleSection
        advanced
        title="Service"
        resource={service}
        setResource={setService}
        actions={serviceActions}
      >
        <ResourceForm.FormField
          advanced
          propertyPath="$.spec.ports[0].port"
          label={t('deployments.create-modal.advanced.port')}
          input={(value, setValue) => (
            <ResourceForm.Input
              type="number"
              required
              placeholder={t(
                'deployments.create-modal.advanced.port-placeholder',
              )}
              disabled={!createService}
              value={value}
              onChange={e => setValue(e.target.valueAsNumber)}
            />
          )}
        />
        <ResourceForm.FormField
          advanced
          propertyPath="$.spec.ports[0].targetPort"
          label={t('deployments.create-modal.advanced.target-port')}
          input={(value, setValue) => (
            <ResourceForm.Input
              type="number"
              required
              placeholder={t(
                'deployments.create-modal.advanced.target-port-placeholder',
              )}
              disabled={!createService}
              value={value}
              onChange={e => setValue(e.target.valueAsNumber)}
            />
          )}
        />
      </ResourceForm.CollapsibleSection>
    </ResourceForm>
  );
}
