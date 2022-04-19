import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { K8sNameField, TextArrayInput } from 'shared/ResourceForm/fields';

export function SingleContainerForm({
  container,
  containers,
  setContainers,
  isAdvanced,
  readOnly,
  prefix,
}) {
  const { t } = useTranslation();

  const imagePullPolicyOptions = ['IfNotPresent', 'Always', 'Never'].map(o => ({
    key: o,
    text: o,
  }));

  return (
    <ResourceForm.Wrapper
      resource={container}
      setResource={() => setContainers([...containers])}
      isAdvanced={isAdvanced}
    >
      <K8sNameField
        propertyPath="$.name"
        kind={t('jobs.create-modal.container')}
        readOnly={readOnly}
        prefix={prefix}
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
      <TextArrayInput
        propertyPath="$.command"
        title={t('jobs.create-modal.labels.command')}
        placeholder={t('jobs.create-modal.placeholders.command')}
        tooltipContent={t('jobs.create-modal.tooltips.command')}
        readOnly={readOnly}
      />
      <TextArrayInput
        advanced
        propertyPath="$.args"
        title={t('jobs.create-modal.labels.args')}
        placeholder={t('jobs.create-modal.placeholders.args')}
        tooltipContent={t('jobs.create-modal.tooltips.args')}
        readOnly={readOnly}
      />
    </ResourceForm.Wrapper>
  );
}

export function SingleContainerInput({
  value: containers,
  setValue: setContainers,
  readOnly,
  ...props
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
        {...props}
      />
    </ResourceForm.CollapsibleSection>
  );
}
