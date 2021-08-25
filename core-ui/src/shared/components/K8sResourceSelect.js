import React from 'react';
import { ComboboxInput } from 'fundamental-react';
import { useGetList, k8sNamePattern } from 'react-shared';
import { useTranslation } from 'react-i18next';

export function K8sResourceSelect({
  url,
  onSelect,
  resourceType,
  value,
  ...fdSelectProps
}) {
  const { t } = useTranslation();

  resourceType = resourceType || t('common.labels.resource');

  const { data, loading, error } = useGetList()(url, {
    pollingInterval: 5000,
  });

  const resourceNames = (data || []).map(s => s.metadata.name);
  const options = resourceNames.map(name => ({ key: name, text: name }));

  const getValidationState = () => {
    if (error) {
      return {
        state: 'error',
        text: t('common.messages.cannot-load', {
          value: resourceType,
          error: error.message,
        }),
      };
    } else if (loading) {
      return {
        state: 'info',
        text: t('common.headers.loading'),
      };
    } else if (!!value && !resourceNames.includes(value)) {
      return {
        state: 'warning',
        text: t('common.headers.not-found', {
          value: `${resourceType} ${value}`,
        }),
      };
    } else return undefined;
  };

  fdSelectProps = {
    ...fdSelectProps,
    inputProps: {
      ...fdSelectProps?.inputProps,
      value,
    },
  };

  return (
    <ComboboxInput
      compact
      placeholder={t('common.messages.type-to-select', { value: resourceType })}
      id="k8s-resource-dropdown"
      ariaLabel={t('common.messages.choose', { value: resourceType })}
      options={options}
      onSelectionChange={(_, selected) => onSelect(selected.text)}
      validationState={getValidationState()}
      {...fdSelectProps}
      inputProps={{ pattern: k8sNamePattern, ...fdSelectProps?.inputProps }}
    />
  );
}
