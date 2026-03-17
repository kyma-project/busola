import { ComboBox, ComboBoxItem, Text } from '@ui5/webcomponents-react';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { k8sNamePattern } from 'shared/components/K8sNameInput/K8sNameInput';
import { useTranslation } from 'react-i18next';
import pluralize from 'pluralize';
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';

interface K8sResourceSelectBaseProps {
  onSelect: (value: string, resource: any) => void;
  resource?: string;
  value: string;
  required?: boolean;
  isNamespaced?: boolean;
  resourceType?: string;
  'data-testid'?: string;
}

interface K8sResourceSelectWithUseGetListProps
  extends K8sResourceSelectBaseProps {
  url?: string | null;
  filter?: (item: any) => Promise<string | true | null>;
}

export function K8sResourceSelectWithUseGetList({
  url,
  filter = undefined,
  ...props
}: K8sResourceSelectWithUseGetListProps) {
  const { data, error, ...listCall } = useGetList(filter)(url, {
    //@ts-expect-error Type mismatch between js and ts
    pollingInterval: 7000,
  });

  return (
    <K8sResourceSelect
      data={data as any}
      error={error as any}
      {...props}
      {...listCall}
    />
  );
}

interface K8sResourceSelectProps extends K8sResourceSelectBaseProps {
  data?: object | object[];
  loading: boolean;
  error: any;
  disabled?: boolean;
}

type GetValidationState =
  | {
      state: keyof typeof ValueState;
      text: string;
    }
  | {
      state: keyof typeof ValueState;
      text?: undefined;
    };

function K8sResourceSelect({
  data,
  loading,
  error,
  onSelect,
  resourceType,
  value,
  required,
  isNamespaced = true,
  ...props
}: K8sResourceSelectProps) {
  const { t } = useTranslation();

  resourceType = resourceType || t('common.labels.resource');
  const pluralResourceType = pluralize(resourceType);

  const resourceNames = (Array.isArray(data) ? data : []).map(
    (s) => s.metadata.name,
  );
  const options = resourceNames.map((name, idx) => ({ key: idx, text: name }));

  const getValidationState = (): GetValidationState => {
    if (error) {
      return {
        state: 'Negative',
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
    } else
      return {
        state: 'None',
      };
  };

  const onChange = (event: any) => {
    const selectedOption = options.find(
      (o) => o.text === event.target.value,
    ) ?? {
      key: event.target._state.filterValue,
      text: event.target._state.filterValue,
    };
    onSelect(selectedOption.text, data);
  };

  return (
    <ComboBox
      required={required}
      disabled={props.disabled || !options?.length}
      placeholder={t('common.messages.type-to-select', {
        value: resourceType,
      })}
      id="k8s-resource-dropdown"
      data-testid={props['data-testid']}
      accessibleName={t('common.messages.choose', { value: resourceType })}
      onChange={onChange}
      onInput={onChange}
      value={value}
      valueState={getValidationState()?.state}
      valueStateMessage={<Text>{getValidationState()?.text}</Text>}
      //@ts-expect-error Property 'pattern' doesn't exist on ComboBox types, but it is probably supported
      pattern={k8sNamePattern}
    >
      {options.map((option) => (
        <ComboBoxItem key={option.key} text={option.text} />
      ))}
    </ComboBox>
  );
}
