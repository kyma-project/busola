import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

export function TextRef({
  text,
  setText,
  defaultOpen = false,
  required = true,
}) {
  const { t } = useTranslation();

  return (
    <ResourceForm.TextArrayInput
      key="text-ref-input"
      required={required}
      defaultOpen={defaultOpen}
      propertyPath="$.spec.text"
      title={t('dnsentries.labels.text')}
      tooltipContent={t('dnsentries.tooltips.text')}
      inputProps={{
        placeholder: t('dnsentries.tooltips.text'),
      }}
      value={text}
      setValue={setText}
    />
  );
}
