import React from 'react';
import {
  ResourceForm,
  ResourceFormWrapper,
} from 'shared/ResourceForm/ResourceForm';
import { useTranslation } from 'react-i18next';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

export function SingleContainerForm({
  container,
  containers,
  setContainers,
  advanced,
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
    >
      <ResourceForm.K8sNameField
        propertyPath="$.name"
        kind={t('cron-jobs.create-modal.container')}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.image"
        label={t('cron-jobs.docker-image')}
        input={Inputs.Text}
        placeholder={t('cron-jobs.create-modal.placeholders.docker-image')}
      />
      {advanced && (
        <ResourceForm.FormField
          required
          className="fd-margin-bottom--sm"
          propertyPath="$.imagePullPolicy"
          label={t('cron-jobs.image-pull-policy')}
          input={Inputs.Dropdown}
          options={imagePullPolicyOptions}
        />
      )}
      <ResourceForm.TextArrayInput
        required
        propertyPath="$.command"
        title={t('cron-jobs.command')}
        placeholder={t('cron-jobs.create-modal.placeholders.command')}
        tooltipContent={t('cron-jobs.create-modal.tooltips.command')}
      />
      {advanced && (
        <ResourceForm.TextArrayInput
          required
          propertyPath="$.args"
          title={t('cron-jobs.args')}
          placeholder={t('cron-jobs.create-modal.placeholders.args')}
          tooltipContent={t('cron-jobs.create-modal.tooltips.args')}
        />
      )}
    </ResourceFormWrapper>
  );
}

export function SingleContainerInput({
  value: containers,
  setValue: setContainers,
}) {
  const { t } = useTranslation();

  return (
    <ResourceForm.CollapsibleSection
      title={t('cron-jobs.create-modal.container')}
      defaultOpen
    >
      <SingleContainerForm
        container={containers?.[0]}
        containers={containers}
        setContainers={setContainers}
      />
    </ResourceForm.CollapsibleSection>
  );
}
