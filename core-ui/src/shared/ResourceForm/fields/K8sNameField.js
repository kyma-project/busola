import React from 'react';
import { K8sNameInput } from 'shared/components/K8sNameInput/K8sNameInput';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from '..';

export function K8sNameField({ kind, value, setValue, className, ...props }) {
  const { t, i18n } = useTranslation();

  const { isAdvanced, propertyPath, validate, ...inputProps } = props;

  return (
    <ResourceForm.FormField
      required
      className={className}
      propertyPath="$.metadata.name"
      label={t('common.labels.name')}
      tooltipContent={t('common.tooltips.k8s-name-input')}
      input={() => {
        return (
          <K8sNameInput
            kind={kind}
            compact
            required
            showHelp={false}
            showLabel={false}
            onChange={e => setValue(e.target.value)}
            value={value}
            i18n={i18n}
            {...inputProps}
          />
        );
      }}
    />
  );
}
