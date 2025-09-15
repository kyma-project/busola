import { useTranslation } from 'react-i18next';
import {
  ComboBox,
  ComboBoxItem,
  MessageStrip,
  Text,
} from '@ui5/webcomponents-react';
import classnames from 'classnames';
import { useAtomValue } from 'jotai';

import { showHiddenNamespacesAtom } from 'state/preferences/showHiddenNamespacesAtom';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourceForm } from 'shared/ResourceForm';

import './ExternalResourceRef.scss';

export function ExternalResourceRef({
  value,
  resources = [],
  loading,
  title,
  labelPrefix,
  tooltipContent,
  actions,
  className,
  setValue,
  required = false,
  defaultOpen = undefined,
  currentNamespace,
  noSection,
  error,
  index,
  children,
  nestingLevel = 0,
  defaultNamespace,
}) {
  const { t } = useTranslation();
  const namespacesUrl = '/api/v1/namespaces';
  const {
    data: namespaces,
    loading: namespacesLoading,
    error: namespacesError,
  } = useGetList()(namespacesUrl);

  const showHiddenNamespaces = useAtomValue(showHiddenNamespacesAtom);
  const hiddenNamespaces = useGetHiddenNamespaces();
  const namespaceData = {
    metadata: {
      name: defaultNamespace,
    },
  };

  const namespacesOptions = (
    namespacesError ? [namespaceData] : namespaces || []
  )
    .filter((ns) =>
      showHiddenNamespaces
        ? true
        : !hiddenNamespaces.includes(ns.metadata.name),
    )
    ?.map((ns) => ({
      key: ns.metadata.name,
      text: ns.metadata.name,
    }));

  if (loading || namespacesLoading) return <Spinner />;
  if (error)
    return (
      <MessageStrip design="Information" hideCloseButton>
        {t('common.errors.couldnt-fetch-resources')}
      </MessageStrip>
    );

  const allResourcesOptions = resources?.map((resource) => ({
    key: resource.metadata.name,
    text: resource.metadata.name,
    namespace: resource.metadata.namespace,
  }));

  let filteredResourcesOptions = [];
  if (value?.namespace?.length) {
    filteredResourcesOptions = allResourcesOptions?.filter(
      (resource) => value?.namespace === resource.namespace,
    );
  } else if (currentNamespace) {
    filteredResourcesOptions = allResourcesOptions?.filter(
      (resource) => currentNamespace === resource.namespace,
    );
  }

  const namespaceValid =
    !value?.namespace ||
    namespacesOptions?.find((ns) => ns.key === value.namespace);
  const nameValid =
    !value?.name ||
    filteredResourcesOptions?.find((res) => res.key === value.name);

  const content = () => {
    return [
      <ResourceForm.FormField
        key="namespace-input"
        required={required}
        label={t('common.labels.resource-namespace', { resource: labelPrefix })}
        tooltipContent={t('common.tooltips.resource-ref-namespace', {
          resource: labelPrefix,
        })}
        input={() => (
          <ComboBox
            id={`secret-namespace-combobox-${index}`}
            accessibleName="Secret namespace Combobox"
            placeholder={t('common.placeholders.secret-ref-namespace')}
            onChange={(event) => {
              const selectedOption = namespacesOptions.find(
                (o) => o.text === event.target.value,
              );
              if (selectedOption)
                setValue({ name: '', namespace: selectedOption.text });
            }}
            required={required}
            value={value?.namespace || ''}
            valueState={namespaceValid ? null : 'Negative'}
            valueStateMessage={
              <Text>
                {namespaceValid
                  ? ''
                  : t('common.messages.resource-namespace-error')}
              </Text>
            }
          >
            {namespacesOptions.map((namespace) => (
              <ComboBoxItem
                key={namespace.key}
                id={namespace.key}
                text={namespace.text}
              />
            ))}
          </ComboBox>
        )}
      />,
      <ResourceForm.FormField
        key="name-input"
        required={required}
        label={t('common.labels.resource-name', { resource: labelPrefix })}
        tooltipContent={t('common.tooltips.resource-ref-name', {
          resource: labelPrefix,
        })}
        input={() => (
          <div className="bsl-col-md--12">
            <ComboBox
              id={`secret-name-combobox-${index}`}
              accessibleName="Secret name Combobox"
              disabled={!filteredResourcesOptions?.length}
              placeholder={t('common.placeholders.secret-ref-name')}
              onChange={(event) => {
                const selectedOption = filteredResourcesOptions.find(
                  (o) => o.text === event.target.value,
                );
                if (selectedOption)
                  setValue({
                    name: selectedOption.text,
                    namespace: value?.namespace,
                  });
              }}
              required={required}
              value={value?.name || ''}
              valueState={nameValid ? null : 'Negative'}
              valueStateMessage={
                <Text>
                  {nameValid ? '' : t('common.messages.resource-name-error')}
                </Text>
              }
            >
              {filteredResourcesOptions.map((filteredResource) => (
                <ComboBoxItem
                  id={filteredResource.key}
                  text={filteredResource.text}
                />
              ))}
            </ComboBox>
          </div>
        )}
      />,
    ];
  };

  if (noSection) return <>{content()}</>;
  return (
    <ResourceForm.CollapsibleSection
      title={title}
      tooltipContent={tooltipContent}
      actions={actions}
      className={classnames('external-resource-ref', className)}
      defaultOpen={defaultOpen}
      required={required}
      nestingLevel={nestingLevel}
    >
      {content()}
      {children}
    </ResourceForm.CollapsibleSection>
  );
}
