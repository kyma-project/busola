import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxInput } from 'fundamental-react';
import classnames from 'classnames';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { CollapsibleSection } from 'shared/ResourceForm/components/FormComponents';

import './ExternalResourceRef.scss';

export function ExternalResourceRef({
  value,
  resources,
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
}) {
  const { t } = useTranslation();

  const resourceNamespaces = [
    ...new Set((resources || []).map(resource => resource.metadata.namespace)),
  ];
  const namespacesOptions = resourceNamespaces.map(namespace => ({
    key: namespace,
    text: namespace,
  }));
  namespacesOptions.unshift({
    key: '',
    text: 'All namespaces',
  });

  const allResourcesOptions = (resources || []).map(resource => ({
    key: resource.metadata.name,
    text: resource.metadata.name,
    namespace: resource.metadata.namespace,
  }));

  let filteredResourcesOptions = allResourcesOptions;
  if (value?.namespace?.length) {
    filteredResourcesOptions = allResourcesOptions.filter(
      resource => value?.namespace === resource.namespace,
    );
  }
  const open = defaultOpen === undefined ? !isAdvanced : defaultOpen;
  return (
    <CollapsibleSection
      title={title}
      tooltipContent={tooltipContent}
      actions={actions}
      className={classnames('external-resource-ref', className)}
      defaultOpen={open}
      required={required}
    >
      <ResourceForm.FormField
        required={required}
        label={t('common.labels.resource-namespace', { resource: labelPrefix })}
        tooltipContent={t('common.tooltips.secret-ref-namespace')}
        input={() => (
          <ComboboxInput
            compact
            showAllEntries
            searchFullString
            options={namespacesOptions}
            placeholder={t('common.placeholders.secret-ref-namespace')}
            value={value?.namespace}
            onSelect={e => {
              setValue({
                name: undefined,
                namespace: e.target.value,
              });
            }}
          />
        )}
      />
      <ResourceForm.FormField
        required={required}
        label={t('common.labels.resource-name', { resource: labelPrefix })}
        tooltipContent={t('common.tooltips.secret-ref-name')}
        input={() => (
          <ComboboxInput
            compact
            showAllEntries
            searchFullString
            options={filteredResourcesOptions}
            placeholder={t('common.placeholders.secret-ref-name')}
            value={value?.name}
            onSelect={e => {
              setValue({
                name: e.target.value,
                namespace: value.namespace,
              });
            }}
          />
        )}
      />
    </CollapsibleSection>
  );
}
