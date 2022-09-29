import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  SimpleContainersView,
  AdvancedContainersView,
} from 'shared/components/Deployment/ContainersViews';

import { createContainerTemplate, createReplicaSetTemplate } from './templates';

import './ReplicaSetCreate.scss';

export function ReplicaSetCreate({
  resourceUrl,
  resource: initialReplicaSet,
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  ...props
}) {
  const { t } = useTranslation();

  const [replicaset, setReplicaSet] = useState(
    _.cloneDeep(initialReplicaSet) || createReplicaSetTemplate(namespace),
  );

  useEffect(() => {
    const hasAnyContainers = !!(
      jp.value(replicaset, '$.spec.template.spec.containers') || []
    ).length;

    setCustomValid(hasAnyContainers);
  }, [replicaset, setCustomValid]);

  const handleNameChange = name => {
    jp.value(replicaset, '$.metadata.name', name);
    jp.value(replicaset, "$.metadata.labels['app.kubernetes.io/name']", name);
    jp.value(replicaset, '$.spec.template.spec.containers[0].name', name);
    jp.value(replicaset, '$.spec.selector.matchLabels.app', name); // match labels
    jp.value(replicaset, '$.spec.template.metadata.labels.app', name); // pod labels
    setReplicaSet({ ...replicaset });
  };

  return (
    <ResourceForm
      {...props}
      pluralKind="replicasets"
      singularName={t(`replica-sets.name_singular`)}
      resource={replicaset}
      setResource={setReplicaSet}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      initialResource={initialReplicaSet}
      handleNameChange={handleNameChange}
    >
      <ResourceForm.FormField
        required
        propertyPath="$.spec.replicas"
        label={t('replica-sets.create-modal.labels.replicas')}
        input={Inputs.Number}
        placeholder={t('replica-sets.create-modal.placeholders.replicas')}
        tooltipContent={t('replica-sets.create-modal.tooltips.replicas')}
        min={0}
      />

      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.minReadySeconds"
        label={t('replica-sets.create-modal.labels.min-ready-seconds')}
        input={Inputs.Number}
        placeholder={t(
          'replica-sets.create-modal.placeholders.min-ready-seconds',
        )}
        tooltipContent={t(
          'replica-sets.create-modal.tooltips.min-ready-seconds',
        )}
        min={0}
      />

      <SimpleContainersView
        simple
        resource={replicaset}
        setResource={setReplicaSet}
      />

      <AdvancedContainersView
        advanced
        resource={replicaset}
        setResource={setReplicaSet}
        onChange={onChange}
        namespace={namespace}
        createContainerTemplate={createContainerTemplate}
      />
    </ResourceForm>
  );
}
ReplicaSetCreate.allowEdit = true;
