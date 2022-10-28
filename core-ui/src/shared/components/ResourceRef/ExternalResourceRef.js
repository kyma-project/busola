import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxInput, MessageStrip } from 'fundamental-react';
import classnames from 'classnames';
import { useRecoilValue } from 'recoil';

import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
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
  isAdvanced,
  setValue,
  required = false,
  defaultOpen = undefined,
  currentNamespace,
  noSection,
  error,
  index,
  children,
  nestingLevel = 0,
}) {
  const { t } = useTranslation();
  const namespacesUrl = '/api/v1/namespaces';
  const { data: namespaces, loading: namespacesLoading } = useGetList()(
    namespacesUrl,
  );

  const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);

  const hiddenNamespaces = useGetHiddenNamespaces();

  const namespacesOptions = (namespaces || [])
    .filter(ns =>
      showHiddenNamespaces
        ? true
        : !hiddenNamespaces.includes(ns.metadata.name),
    )
    ?.map(ns => ({
      key: ns.metadata.name,
      text: ns.metadata.name,
    }));

  if (loading || namespacesLoading) return <Spinner compact={true} />;
  if (error)
    return (
      <MessageStrip dismissible={false} type="information">
        {t('common.errors.couldnt-fetch-resources')}
      </MessageStrip>
    );

  const allResourcesOptions = resources?.map(resource => ({
    key: resource.metadata.name,
    text: resource.metadata.name,
    namespace: resource.metadata.namespace,
  }));

  let filteredResourcesOptions = [];
  if (value?.namespace?.length) {
    filteredResourcesOptions = allResourcesOptions?.filter(
      resource => value?.namespace === resource.namespace,
    );
  } else if (currentNamespace) {
    filteredResourcesOptions = allResourcesOptions?.filter(
      resource => currentNamespace === resource.namespace,
    );
  }

  const namespaceValid =
    !value?.namespace ||
    namespacesOptions?.find(ns => ns.key === value.namespace);
  const nameValid =
    !value?.name ||
    filteredResourcesOptions?.find(res => res.key === value.name);

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
          <div className="fd-col fd-col-md--11">
            <ComboboxInput
              id={`secret-namespace-combobox-${index}`}
              ariaLabel="Secret namespace Combobox"
              arrowLabel="Secret namespace Combobox arrow"
              compact
              showAllEntries
              searchFullString
              selectionType="manual"
              options={namespacesOptions}
              placeholder={t('common.placeholders.secret-ref-namespace')}
              typedValue={value?.namespace || ''}
              selectedKey={value?.namespace}
              onSelect={e => {
                setValue({
                  name: '',
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
              required={required}
            />
          </div>
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
          <div className="fd-col fd-col-md--11">
            <ComboboxInput
              id={`secret-name-combobox-${index}`}
              ariaLabel="Secret name Combobox"
              arrowLabel="Secret name Combobox arrow"
              compact
              showAllEntries
              searchFullString
              selectionType="manual"
              options={filteredResourcesOptions}
              placeholder={t('common.placeholders.secret-ref-name')}
              selectedKey={value?.name || ''}
              typedValue={value?.name || ''}
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
              required={required}
            />
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
      isAdvanced={isAdvanced}
      required={required}
      nestingLevel={nestingLevel}
    >
      {content()}
      {children}
    </ResourceForm.CollapsibleSection>
  );
}
