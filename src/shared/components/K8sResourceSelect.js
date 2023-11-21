import PropTypes from 'prop-types';
import { ComboBox, ComboBoxItem, Text } from '@ui5/webcomponents-react';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { k8sNamePattern } from 'shared/components/K8sNameInput/K8sNameInput';
import { useTranslation } from 'react-i18next';
import pluralize from 'pluralize';

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
  resourceType,
  value,
  required,
  isNamespaced = true,
  ...props
}) {
  const { t } = useTranslation();

  resourceType = resourceType || t('common.labels.resource');
  const pluralResourceType = pluralize(resourceType);

  const resourceNames = (data || []).map(s => s.metadata.name);
  const options = resourceNames.map(name => ({ key: name, text: name }));

  const getValidationState = () => {
    if (error) {
      return {
        state: 'Error',
        text: t('common.messages.cannot-load', {
          value: pluralResourceType,
          error: error.message,
        }),
      };
    } else if (loading) {
      return {
        state: 'Information',
        text: t('common.headers.loading'),
      };
    } else if (!resourceNames.length) {
      return {
        state: 'Information',
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

  const onChange = event => {
    const selectedOption = options.find(o => o.text === event.target.value) ?? {
      key: event.target._state.filterValue,
      text: event.target._state.filterValue,
    };
    onSelect(selectedOption.text, data);
  };

  return (
    <div className="bsl-col bsl-col-md--11">
      <ComboBox
        required={required}
        disabled={props.disabled || !options?.length}
        placeholder={t('common.messages.type-to-select', {
          value: resourceType,
        })}
        id="k8s-resource-dropdown"
        data-testid={props['data-testid']}
        aria-label={t('common.messages.choose', { value: resourceType })}
        onChange={onChange}
        onInput={onChange}
        value={value}
        valueState={getValidationState()?.state}
        valueStateMessage={<Text>{getValidationState()?.text}</Text>}
        pattern={k8sNamePattern}
      >
        {options.map(option => (
          <ComboBoxItem id={option.key} text={option.text} />
        ))}
      </ComboBox>
    </div>
  );
}
