import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-shared';
import classnames from 'classnames';
import {
  CollapsibleSection,
  Label,
} from 'shared/ResourceForm/components/FormComponents';

import './ExternalResourceRef.scss';

export function ExternalResourceRef({
  resourceRef,
  onChange,
  resources,
  title,
  labelPrefix,
  tooltipContent,
  actions,
  className,
  isAdvanced,
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
  if (resourceRef.namespace?.length) {
    filteredResourcesOptions = allResourcesOptions.filter(
      resource => resourceRef.namespace === resource.namespace,
    );
  }
  const open = defaultOpen === undefined ? !isAdvanced : defaultOpen;
  return (
    <CollapsibleSection
      title={title}
      tooltipContent={tooltipContent}
      actions={actions}
      className={className}
      defaultOpen={open}
      required={required}
    >
      <div className={classnames('fd-row form-field')}>
        <div className="fd-col fd-col-md--4 form-field__label">
          <Label
            required={required}
            tooltipContent={t('common.tooltips.secret-ref-namespace')}
          >
            {labelPrefix + ' '}
            {t('common.labels.namespace')}
          </Label>
        </div>
        <div className="fd-col fd-col-md--7">
          <Dropdown
            id="external-resource-dropdown"
            compact
            fullWidth
            options={namespacesOptions}
            placeholder={t('common.placeholders.secret-ref-namespace')}
            selectedKey={resourceRef.namespace}
            onSelect={(e, selected) => {
              onChange({
                ...resourceRef,
                name: undefined,
                namespace: selected.key,
              });
            }}
          />
        </div>
      </div>
      <div className={classnames('fd-row form-field')}>
        <div className="fd-col fd-col-md--4 form-field__label">
          <Label
            required={required}
            tooltipContent={t('common.tooltips.secret-ref-name')}
          >
            {labelPrefix + ' '}
            {t('common.lowercase.name')}
          </Label>
        </div>
        <div className="fd-col fd-col-md--7">
          <Dropdown
            id="external-resource-dropdown"
            compact
            fullWidth
            options={filteredResourcesOptions}
            placeholder={t('common.placeholders.secret-ref-name')}
            selectedKey={resourceRef.name}
            onSelect={(e, selected) => {
              onChange({
                ...resourceRef,
                name: selected.key,
                namespace: selected.namespace,
              });
            }}
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}
