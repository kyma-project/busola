import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  usePost,
  useNotification,
  matchBySelector,
  matchByOwnerReference,
} from 'react-shared';
import { Checkbox } from 'fundamental-react';
import * as jp from 'jsonpath';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';

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

function DeploymentsCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialDeployment,
  resourceUrl,
}) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();

  const [deployment, setDeployment] = useState(
    initialDeployment
      ? _.cloneDeep(initialDeployment)
      : createDeploymentTemplate(namespace),
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
      >
        <Editor
          readonly={!createService}
          value={service}
          setValue={setService}
        />
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
      renderEditor={!initialDeployment ? renderEditor : null}
      presets={createPresets(namespace, t)}
      onPresetSelected={value => {
        setDeployment(value.deployment);
        setCreateService(!!value.service);
        if (value.service) {
          setService(value.service);
        }
      }}
      // create modal on a namespace details doesn't have the resourceUrl
      createUrl={
        resourceUrl || `/apis/apps/v1/namespaces/${namespace}/deployments/`
      }
      initialResource={initialDeployment}
    >
      <K8sNameField
        readOnly={!!initialDeployment}
        propertyPath="$.metadata.name"
        kind={t('deployments.name_singular')}
        setValue={handleNameChange}
        validate={value => !!value}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <KeyValueField
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

      {!initialDeployment && (
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
            placeholder={t(
              'deployments.create-modal.advanced.port-placeholder',
            )}
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
      )}
    </ResourceForm>
  );
}

DeploymentsCreate.allowEdit = true;
DeploymentsCreate.resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
  relations: [
    {
      kind: 'Service',
    },
    {
      kind: 'HorizontalPodAutoscaler',
    },
    {
      kind: 'ReplicaSet',
    },
  ],
  matchers: {
    HorizontalPodAutoscaler: (deployment, hpa) => {
      console.log('HorizontalPodAutoscaler', deployment, hpa);
      return (
        hpa.spec.scaleTargetRef?.kind === 'Deployment' &&
        hpa.spec.scaleTargetRef?.name === deployment.metadata.name
      );
    },
    Service: (deployment, service) =>
      matchBySelector(
        deployment.spec.selector.matchLabels,
        service.spec.selector,
      ),
    ReplicaSet: (deployment, replicaSet) =>
      matchByOwnerReference({
        resource: replicaSet,
        owner: deployment,
      }),
  },
});
export { DeploymentsCreate };
