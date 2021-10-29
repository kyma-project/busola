import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxInput } from 'fundamental-react';
import classnames from 'classnames';
import LuigiClient from '@luigi-project/client';

import { useGetList, getFeatureToggle, Spinner } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { CollapsibleSection } from 'shared/ResourceForm/components/FormComponents';

import './ExternalResourceRef.scss';

export function ExternalResourceRef({
  value,
  resources,
  loading,
  title,
  labelPrefix,
  tooltipContent,
  actions,
  className,
  isAdvanced,
  propertyPath,
  setValue,
  required = false,
  defaultOpen = undefined,
  currentNamespace,
  noSection,
  index,
}) {
  const { t } = useTranslation();
  const namespacesUrl = '/api/v1/namespaces';
  const { data: namespaces, loading: namespacesLoading } = useGetList()(
    namespacesUrl,
  );

  const showHiddenNamespaces = getFeatureToggle('showHiddenNamespaces');
  const hiddenNamespaces = LuigiClient.getContext().hiddenNamespaces;

  const namespacesOptions = (namespaces || [])
    .filter(ns =>
      showHiddenNamespaces
        ? true
        : !hiddenNamespaces.includes(ns.metadata.name),
    )
    .map(ns => ({
      key: ns.metadata.name,
      text: ns.metadata.name,
    }));

  if (loading || namespacesLoading) return <Spinner compact={true} />;

  const allResourcesOptions = resources.map(resource => ({
    key: resource.metadata.name,
    text: resource.metadata.name,
    namespace: resource.metadata.namespace,
  }));

  let filteredResourcesOptions = [];
  if (value?.namespace?.length) {
    filteredResourcesOptions = allResourcesOptions.filter(
      resource => value?.namespace === resource.namespace,
    );
  } else if (currentNamespace) {
    filteredResourcesOptions = allResourcesOptions.filter(
      resource => currentNamespace === resource.namespace,
    );
  }

  const namespaceValid =
    !value?.namespace ||
    namespacesOptions.find(ns => ns.key === value.namespace);
  const nameValid =
    !value?.name ||
    filteredResourcesOptions.find(res => res.key === value.name);

  const open = defaultOpen === undefined ? !isAdvanced : defaultOpen;

  const content = () => {
    return [
      <ResourceForm.FormField
        required={required}
        label={t('common.labels.resource-namespace', { resource: labelPrefix })}
        tooltipContent={t('common.tooltips.resource-ref-namespace', {
          resource: labelPrefix,
        })}
        input={() => (
          <ComboboxInput
            id={`secret-namespace-combobox-${index}`}
            ariaLabel="Secret namespace Combobox"
            arrowLabel="Secret namespace Combobox arrow"
            compact
            showAllEntries
            searchFullString
            selectionType="auto-inline"
            options={namespacesOptions}
            placeholder={t('common.placeholders.secret-ref-namespace')}
            value={value?.namespace}
            selectedKey={value?.namespace}
            defaultKey={value?.namespace}
            onSelect={e => {
              setValue({
                name: undefined,
                namespace: e.target.value,
              });
            }}
            validationState={
              namespaceValid
                ? null
                : {
                    state: 'error',
                    text: t('common.messages.resource-namespace-error'),
                  }
            }
          />
        )}
      />,
      <ResourceForm.FormField
        required={required}
        label={t('common.labels.resource-name', { resource: labelPrefix })}
        tooltipContent={t('common.tooltips.resource-ref-name', {
          resource: labelPrefix,
        })}
        input={() => (
          <ComboboxInput
            id={`secret-name-combobox-${index}`}
            ariaLabel="Secret name Combobox"
            arrowLabel="Secret name Combobox arrow"
            compact
            showAllEntries
            searchFullString
            selectionType="auto-inline"
            options={filteredResourcesOptions}
            placeholder={t('common.placeholders.secret-ref-name')}
            value={value?.namespace}
            selectedKey={value?.name}
            defaultKey={value?.name}
            onSelect={e => {
              setValue({
                name: e.target.value,
                namespace: value?.namespace,
              });
            }}
            validationState={
              nameValid
                ? null
                : {
                    state: 'error',
                    text: t('common.messages.resource-name-error'),
                  }
            }
          />
        )}
      />,
    ];
  };

  if (noSection) return <>{content()}</>;
  return (
    <CollapsibleSection
      title={title}
      tooltipContent={tooltipContent}
      actions={actions}
      className={classnames('external-resource-ref', className)}
      defaultOpen={open}
      required={required}
    >
      {content()}
    </CollapsibleSection>
  );
}
