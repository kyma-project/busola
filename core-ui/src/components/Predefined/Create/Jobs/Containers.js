import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  ResourceForm,
  ResourceFormWrapper,
} from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

export function SingleContainerForm({
  container,
  containers,
  setContainers,
  isAdvanced,
  readOnly,
}) {
  const { t } = useTranslation();

  const imagePullPolicyOptions = ['IfNotPresent', 'Always', 'Never'].map(o => ({
    key: o,
    text: o,
  }));

  return (
    <ResourceFormWrapper
      resource={container}
      setResource={() => setContainers([...containers])}
      isAdvanced={isAdvanced}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.name"
        kind={t('jobs.create-modal.container')}
        readOnly={readOnly}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.image"
        label={t('jobs.create-modal.labels.docker-image')}
        input={Inputs.Text}
        placeholder={t('jobs.create-modal.placeholders.docker-image')}
        readOnly={readOnly}
      />
      <ResourceForm.FormField
        required
        advanced
        className="fd-margin-bottom--sm"
        propertyPath="$.imagePullPolicy"
        label={t('jobs.create-modal.labels.image-pull-policy')}
        input={Inputs.Dropdown}
        options={imagePullPolicyOptions}
        readOnly={readOnly}
      />
      <ResourceForm.TextArrayInput
        required
        propertyPath="$.command"
        title={t('jobs.create-modal.labels.command')}
        placeholder={t('jobs.create-modal.placeholders.command')}
        tooltipContent={t('jobs.create-modal.tooltips.command')}
        readOnly={readOnly}
      />
      <ResourceForm.TextArrayInput
        required
        advanced
        propertyPath="$.args"
        title={t('jobs.create-modal.labels.args')}
        placeholder={t('jobs.create-modal.placeholders.args')}
        tooltipContent={t('jobs.create-modal.tooltips.args')}
        readOnly={readOnly}
      />
    </ResourceFormWrapper>
  );
}

export function SingleContainerInput({
  value: containers,
  setValue: setContainers,
  readOnly,
}) {
  const { t } = useTranslation();

  return (
    <ResourceForm.CollapsibleSection
      title={t('jobs.create-modal.container')}
      defaultOpen
    >
      <SingleContainerForm
        container={containers?.[0]}
        containers={containers}
        setContainers={setContainers}
        readOnly={readOnly}
      />
    </ResourceForm.CollapsibleSection>
  );
}
