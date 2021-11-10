import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePost, useNotification } from 'react-shared';
import { Checkbox } from 'fundamental-react';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

import './Deployments.create.scss';
import {
  createContainerTemplate,
  createDeploymentTemplate,
  createPresets,
  createServiceTemplate,
} from './templates';
import {
  SimpleContainersView,
  AdvancedContainersView,
} from 'shared/components/Deployment/ContainersViews';

export function DeploymentsCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();

  const [deployment, setDeployment] = useState(
    createDeploymentTemplate(namespace),
  );
  const [service, setService] = useState(createServiceTemplate(namespace));
  const [createService, setCreateService] = useState(false);

  useEffect(() => {
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
        resource={deployment}
        setResource={setDeployment}
      >
        {defaultEditor}
      </ResourceForm.CollapsibleSection>
      <ResourceForm.CollapsibleSection
        title={t('services.name_singular')}
        actions={serviceActions}
        resource={service}
        setResource={setService}
      >
        <Editor readonly={!createService} />
      </ResourceForm.CollapsibleSection>
    </div>
  );

  const handleNameChange = name => {
    jp.value(deployment, '$.metadata.name', name);
    jp.value(deployment, "$.metadata.labels['app.kubernetes.io/name']", name);
    jp.value(deployment, '$.spec.template.spec.containers[0].name', name);
    jp.value(deployment, '$.spec.selector.matchLabels.app', name); // match labels
    jp.value(deployment, '$.spec.template.metadata.labels.app', name); // pod labels
    setDeployment({ ...deployment });

    jp.value(service, '$.metadata.name', name);
    jp.value(service, '$.spec.selector.app', name);
    setService({ ...service });
  };

  const afterCreatedFn = async defaultAfterCreatedFn => {
    try {
      if (createService) {
        await postRequest(`/api/v1/namespaces/${namespace}/services`, service);
      }
      defaultAfterCreatedFn();
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t(
          'deployments.create-modal.messages.deployment-ok-service-bad',
          { error: e.message },
        ),
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
      afterCreatedFn={afterCreatedFn}
      renderEditor={renderEditor}
      presets={createPresets(namespace, t)}
      onPresetSelected={value => {
        setDeployment(value.deployment);
        setCreateService(!!value.service);
        if (value.service) {
          setService(value.service);
        }
      }}
      createUrl={`/apis/apps/v1/namespaces/${namespace}/deployments/`}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('deployments.name_singular')}
        setValue={handleNameChange}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />

      <SimpleContainersView
        simple
        resource={deployment}
        setResource={setDeployment}
      />

      <AdvancedContainersView
        advanced
        resource={deployment}
        setResource={setDeployment}
        onChange={onChange}
        namespace={namespace}
        createContainerTemplate={createContainerTemplate}
      />

      <ResourceForm.CollapsibleSection
        advanced
        title={t('deployments.create-modal.advanced.service')}
        resource={service}
        setResource={setService}
        actions={serviceActions}
      >
        <ResourceForm.FormField
          advanced
          required
          disabled={!createService}
          propertyPath="$.spec.ports[0].port"
          label={t('deployments.create-modal.advanced.port')}
          input={Inputs.Port}
          placeholder={t('deployments.create-modal.advanced.port-placeholder')}
        />
        <ResourceForm.FormField
          advanced
          required
          disabled={!createService}
          propertyPath="$.spec.ports[0].targetPort"
          label={t('deployments.create-modal.advanced.target-port')}
          input={Inputs.Port}
          placeholder={t(
            'deployments.create-modal.advanced.target-port-placeholder',
          )}
        />
      </ResourceForm.CollapsibleSection>
    </ResourceForm>
  );
}
