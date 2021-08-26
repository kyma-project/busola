import React from 'react';
import PropTypes from 'prop-types';
import { ComboboxInput } from 'fundamental-react';
import { useGetList, k8sNamePattern } from 'react-shared';
import { useTranslation } from 'react-i18next';
import pluralize from 'pluralize';

K8sResourceSelect.propTypes = {
  url: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  resource: PropTypes.string,
  value: PropTypes.string.isRequired,
  required: PropTypes.bool,
  isNamespaced: PropTypes.bool,
};

export function K8sResourceSelect({
  url,
  onSelect,
  resourceType,
  value,
  required,
  isNamespaced = true,
}) {
  const { t } = useTranslation();

  resourceType = resourceType || t('common.labels.resource');
  const pluralResourceType = pluralize(resourceType);

  const { data, loading, error } = useGetList()(url, {
    pollingInterval: 7000,
  });

  const resourceNames = (data || []).map(s => s.metadata.name);
  const options = resourceNames.map(name => ({ key: name, text: name }));

  const getValidationState = () => {
    if (error) {
      return {
        state: 'error',
        text: t('common.messages.cannot-load', {
          value: pluralResourceType,
          error: error.message,
        }),
      };
    } else if (loading) {
      return {
        state: 'information',
        text: t('common.headers.loading'),
      };
    } else if (!resourceNames.length) {
      return {
        state: 'information',
        text: isNamespaced
          ? t('common.messages.no-instances-found-namespace', {
              value: pluralResourceType,
            })
          : t('common.messages.no-instances-found', {
              value: pluralResourceType,
            }),
      };
    } else if (!!value && !resourceNames.includes(value)) {
      return {
        state: 'warning',
        text: t('common.messages.not-found', {
          value: `${resourceType} ${value}`,
        }),
      };
    } else return undefined;
  };

  return (
    <ComboboxInput
      compact
      required={required}
      placeholder={t('common.messages.type-to-select', { value: resourceType })}
      id="k8s-resource-dropdown"
      ariaLabel={t('common.messages.choose', { value: resourceType })}
      options={options}
      onSelectionChange={(_, selected) => onSelect(selected.text)}
      validationState={getValidationState()}
      inputProps={{ pattern: k8sNamePattern, value }}
    />
  );
}
