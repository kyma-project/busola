import React, { useState, useEffect } from 'react';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';
import { Checkbox, FormFieldset, Switch } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { MemoryInput } from './MemoryQuotas';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import {
  createNamespaceTemplate,
  createLimitsTemplate,
  createMemoryQuotasTemplate,
} from './templates';

import './CreateNamespace.scss';
import { LimitPresets, MemoryPresets } from './Presets';
import { CONFIG } from 'components/Lambdas/config';

const ISTIO_INJECTION_LABEL = 'istio-injection';
const ISTIO_INJECTION_VALUE = 'disabled';

const NamespacesCreate = props => {
  const {
    formElementRef,
    onChange,
    resource: initialNamespace,
    resourceUrl,
    onCompleted,
    onError,
  } = props;
  const { t } = useTranslation();

  const [namespace, setNamespace] = useState(
    initialNamespace ? cloneDeep(initialNamespace) : createNamespaceTemplate(),
  );
  // container limits
  const [withLimits, setWithLimits] = useState(false);
  const [limits, setLimits] = useState(createLimitsTemplate());
  // memory quotas
  const [withMemory, setWithMemory] = useState(false);
  const [memory, setMemory] = useState(createMemoryQuotasTemplate());

  const [isSidecar, setSidecar] = useState(
    initialNamespace?.metadata?.labels?.[ISTIO_INJECTION_LABEL],
  );

  const createLimitResource = useCreateResource(
    'LimitRange',
    'LimitRanges',
    {
      ...limits,
      metadata: {
        namespace: namespace.metadata.name,
        name: `${namespace.metadata.name}-initial-limits`,
      },
    },
    null,
    `/api/v1/namespaces/${namespace.metadata.name}/limitranges`,
    () => {},
  );

  const createMemoryResource = useCreateResource(
    'ResourceQuota',
    'ResourceQuotas',
    {
      ...memory,
      metadata: {
        namespace: namespace.metadata.name,
        name: `${namespace.metadata.name}-initial-limits`,
      },
    },
    null,
    `/api/v1/namespaces/${namespace.metadata.name}/resourcequotas`,
    () => {},
  );

  useEffect(() => {
    // toggles istio-injection label when 'Disable sidecar injection' is clicked
    if (isSidecar) {
      jp.value(
        namespace,
        `$.metadata.labels["${ISTIO_INJECTION_LABEL}"]`,
        ISTIO_INJECTION_VALUE,
      );
      setNamespace({ ...namespace });
    } else {
      const labels = namespace.metadata.labels || {};
      delete labels[ISTIO_INJECTION_LABEL];
      setNamespace({
        ...namespace,
        metadata: { ...namespace.metadata, labels },
      });
    }
    // eslint-disable-next-line
  }, [isSidecar]);
  useEffect(() => {
    // toggles 'Disable sidecar injection' when istio-injection label is deleted manually
    if (
      isSidecar &&
      jp.value(namespace, `$.metadata.labels["${ISTIO_INJECTION_LABEL}"]`) !==
        ISTIO_INJECTION_VALUE
    ) {
      setSidecar(false);
    }
    // eslint-disable-next-line
  }, [isSidecar]);

  async function afterNamespaceCreated() {
    if (!initialNamespace) {
      LuigiClient.linkManager().navigate(`${namespace.metadata.name}/details`);
    }

    const additionalRequests = [];
    if (withLimits) {
      additionalRequests.push(createLimitResource());
    }
    if (withMemory) {
      additionalRequests.push(createMemoryResource());
    }

    const additionalResults = await Promise.allSettled(additionalRequests);
    const rejectedRequest = additionalResults.find(
      result => result.status === 'rejected',
    );
    if (!rejectedRequest) {
      onCompleted(
        `Namespace ${namespace.metadata.name} ${
          initialNamespace ? 'edited' : 'created'
        }`,
      );
    } else {
      onError(
        'Warning',
        `Your namespace ${namespace.metadata.name} was created successfully, however, Limit Range and/or Resource Quota creation failed. You have to create them manually later: ${rejectedRequest.reason}`,
        true,
      );
    }
  }

  const renderEditor = ({ defaultEditor, Editor }) => (
    <div className="double-editor">
      <ResourceForm.CollapsibleSection
        title={t('deployments.name_singular')}
        defaultOpen
        resource={namespace}
        setResource={setNamespace}
      >
        {defaultEditor}
      </ResourceForm.CollapsibleSection>
      {!initialNamespace && withLimits ? (
        <ResourceForm.CollapsibleSection
          title={t('namespaces.create-modal.container-limits')}
        >
          <Editor value={limits} setValue={setLimits} />
        </ResourceForm.CollapsibleSection>
      ) : null}
      {!initialNamespace && withMemory ? (
        <ResourceForm.CollapsibleSection
          title={t('namespaces.create-modal.memory-quotas')}
        >
          <Editor value={memory} setValue={setMemory} />
        </ResourceForm.CollapsibleSection>
      ) : null}
    </div>
  );

  return (
    <ResourceForm
      pluralKind="namespaces"
      singularName={t('common.labels.namespace')}
      renderEditor={renderEditor}
      resource={namespace}
      setResource={setNamespace}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      initialResource={initialNamespace}
      afterCreatedFn={afterNamespaceCreated}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('common.labels.namespace')}
        readOnly={!!initialNamespace}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
        lockedKeys={[ISTIO_INJECTION_LABEL]}
        lockedValues={[ISTIO_INJECTION_LABEL]}
      />
      <ResourceForm.FormField
        advanced
        label={t('namespaces.create-modal.disable-sidecar')}
        input={() => (
          <Switch
            compact
            onChange={e => {
              setSidecar(!isSidecar);
            }}
            checked={isSidecar}
          />
        )}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />

      {!initialNamespace ? (
        <ResourceForm.CollapsibleSection
          advanced
          title={t('namespaces.create-modal.apply-memory-quotas')}
          actions={() => (
            <div className="additional-resource">
              <Checkbox
                compact
                checked={withMemory}
                onChange={(_, checked) => setWithMemory(checked)}
                dir="rtl"
              >
                {t('namespaces.create-modal.create-resource')}
              </Checkbox>
              <MemoryPresets
                presets={CONFIG['namespaceMemoryQuotasPreset']}
                setValue={setMemory}
              />
            </div>
          )}
        >
          <FormFieldset className="container-limits" advanced>
            <MemoryInput
              label={t('namespaces.create-modal.memory-limits')}
              container={memory}
              setContainer={setMemory}
              propertyPath='$.spec.hard["limits.memory"]'
            />
            <MemoryInput
              label={t('namespaces.overview.resources.requests')}
              container={memory}
              setContainer={setMemory}
              propertyPath='$.spec.hard["requests.memory"]'
            />
          </FormFieldset>
        </ResourceForm.CollapsibleSection>
      ) : null}

      {!initialNamespace ? (
        <ResourceForm.CollapsibleSection
          advanced
          title={t('namespaces.create-modal.apply-limits')}
          actions={() => (
            <div className="additional-resource">
              <Checkbox
                compact
                checked={withLimits}
                onChange={(_, checked) => setWithLimits(checked)}
                dir="rtl"
              >
                {t('namespaces.create-modal.create-resource')}
              </Checkbox>
              <LimitPresets
                presets={CONFIG['namespaceContainerLimitsPreset']}
                setValue={setLimits}
              />
            </div>
          )}
        >
          <FormFieldset className="container-limits" advanced>
            <MemoryInput
              label={t('limit-ranges.headers.max')}
              container={limits}
              setContainer={setLimits}
              propertyPath="$.spec.limits[0].max.memory"
            />
            <MemoryInput
              label={t('limit-ranges.headers.default')}
              container={limits}
              setContainer={setLimits}
              propertyPath="$.spec.limits[0].default.memory"
            />
            <MemoryInput
              label={t('limit-ranges.headers.default-request')}
              container={limits}
              setContainer={setLimits}
              propertyPath="$.spec.limits[0].defaultRequest.memory"
            />
          </FormFieldset>
        </ResourceForm.CollapsibleSection>
      ) : null}
    </ResourceForm>
  );
};

NamespacesCreate.allowEdit = true;
export { NamespacesCreate };
