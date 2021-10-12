import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

export function TextRef({ text, setText }) {
  const { t } = useTranslation();

  return (
    <ResourceForm.TextArrayInput
      key="text-ref-input"
      required
      defaultOpen={false}
      propertyPath="$.spec.text"
      title={t('dnsentries.labels.text')}
      sectionTooltipContent={t('dnsentries.tooltips.text')}
      inputProps={{
        placeholder: t('dnsentries.tooltips.text'),
      }}
      value={text}
      setValue={setText}
    />
  );
}
