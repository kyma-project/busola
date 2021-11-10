import React from 'react';
import PropTypes from 'prop-types';
import { ComboboxInput } from 'fundamental-react';
import { useGetList, k8sNamePattern } from 'react-shared';
import { useTranslation } from 'react-i18next';
import pluralize from 'pluralize';
import './K8sResourceSelect.scss';

const commonPropTypes = {
  onSelect: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  resource: PropTypes.string,
  value: PropTypes.string.isRequired,
  required: PropTypes.bool,
  isNamespaced: PropTypes.bool,
};

K8sResourceSelectWithUseGetList.propTypes = {
  url: PropTypes.string.isRequired,
  ...commonPropTypes,
};

export function K8sResourceSelectWithUseGetList({ url, filter, ...props }) {
  const listCall = useGetList(filter)(url, {
    pollingInterval: 7000,
  });

  return <K8sResourceSelect {...props} {...listCall} />;
}

K8sResourceSelect.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object.isRequired),
  ]),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  ...commonPropTypes,
};

export function K8sResourceSelect({
  data,
  loading,
  error,
  onSelect,
  onChange,
  resourceType,
  value,
  required,
  isNamespaced = true,
}) {
  const { t } = useTranslation();

  resourceType = resourceType || t('common.labels.resource');
  const pluralResourceType = pluralize(resourceType);

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
    } else return undefined;
  };

  return (
    <div className="combobox--full-width">
      <ComboboxInput
        showAllEntries
        searchFullString
        selectionType="auto-inline"
        compact
        required={required}
        placeholder={t('common.messages.type-to-select', {
          value: resourceType,
        })}
        id="k8s-resource-dropdown"
        ariaLabel={t('common.messages.choose', { value: resourceType })}
        arrowLabel="Combobox input arrow"
        options={options}
        onChange={onChange}
        onSelectionChange={(_, selected) => onSelect(selected.text)}
        validationState={getValidationState()}
        inputProps={{ pattern: k8sNamePattern, value }}
      />
    </div>
  );
}
