import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';
import { Checkbox, FormFieldset, Switch } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';

import { ResourceForm } from 'shared/ResourceForm';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import { createLimitRangeTemplate } from 'resources/LimitRanges/templates';
import { createResourceQuotaTemplate } from 'resources/ResourceQuotas/templates';

import { MemoryInput } from './MemoryQuotas';
import { createNamespaceTemplate } from './templates';
import { LimitPresets, MemoryPresets } from './Presets';
import { useSidecar } from 'shared/hooks/useSidecarInjection';
import { CONFIG } from './config';

import './NamespaceCreate.scss';

const ISTIO_INJECTION_LABEL = 'istio-injection';
const ISTIO_INJECTION_ENABLED = 'enabled';

export function NamespaceCreate({
  formElementRef,
  onChange,
  resource: initialNamespace,
  resourceUrl,
  onCompleted,
  onError,
  setCustomValid,
  ...props
}) {
  const { t } = useTranslation();

  const [namespace, setNamespace] = useState(
    initialNamespace ? cloneDeep(initialNamespace) : createNamespaceTemplate(),
  );

  const { isIstioFeatureOn, isSidecarEnabled, setSidecarEnabled } = useSidecar({
    initialRes: initialNamespace,
    res: namespace,
    setRes: setNamespace,
    path: '$.metadata.labels',
    label: ISTIO_INJECTION_LABEL,
    enabled: ISTIO_INJECTION_ENABLED,
  });

  // container limits
  const [withLimits, setWithLimits] = useState(false);
  const [limits, setLimits] = useState(createLimitRangeTemplate({}));
  // memory quotas
  const [withMemory, setWithMemory] = useState(false);
  const [memory, setMemory] = useState(createResourceQuotaTemplate({}));

  const createLimitResource = useCreateResource({
    singularName: 'LimitRange',
    pluralKind: 'LimitRanges',
    resource: limits,
    initialResource: null,
    createUrl: `/api/v1/namespaces/${namespace.metadata?.name}/limitranges`,
    afterCreatedFn: () => {},
  });

  const createMemoryResource = useCreateResource({
    singularName: 'ResourceQuota',
    pluralKind: 'ResourceQuotas',
    resource: memory,
    initialResource: null,
    createUrl: `/api/v1/namespaces/${namespace?.metadata?.name}/resourcequotas`,
    afterCreatedFn: () => {},
  });

  useEffect(() => {
    const name = namespace.metadata?.name;

    if (name) {
      jp.value(memory, '$.metadata.name', `${name}-quotas`);
      jp.value(memory, '$.metadata.namespace', `${name}`);
      setMemory({ ...memory });
    }

    if (name) {
      jp.value(limits, '$.metadata.name', `${name}-limits`);
      jp.value(limits, '$.metadata.namespace', name);
      setLimits({ ...limits });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace.metadata?.name]);

  async function afterNamespaceCreated() {
    if (!initialNamespace) {
      LuigiClient.linkManager().navigate(`${namespace.metadata?.name}/details`);
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
    <div>
      <ResourceForm.CollapsibleSection
        title={t('namespaces.name_singular')}
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
          <Editor
            value={limits}
            setValue={setLimits}
            schemaId="v1/LimitRange"
          />
        </ResourceForm.CollapsibleSection>
      ) : null}
      {!initialNamespace && withMemory ? (
        <ResourceForm.CollapsibleSection
          title={t('namespaces.create-modal.memory-quotas')}
        >
          <Editor
            value={memory}
            setValue={setMemory}
            schemaId="v1/ResourceQuota"
          />
        </ResourceForm.CollapsibleSection>
      ) : null}
    </div>
  );

  return (
    <ResourceForm
      {...props}
      pluralKind="namespaces"
      singularName={t('namespaces.name_singular')}
      renderEditor={!initialNamespace ? renderEditor : null}
      resource={namespace}
      setResource={setNamespace}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      initialResource={initialNamespace}
      afterCreatedFn={afterNamespaceCreated}
      setCustomValid={setCustomValid}
      labelsProps={{
        lockedKeys: [ISTIO_INJECTION_LABEL],
        lockedValues: [ISTIO_INJECTION_LABEL],
      }}
    >
      <ResourceForm.FormField
        advanced={!isIstioFeatureOn}
        label={t('namespaces.create-modal.enable-sidecar')}
        input={() => (
          <Switch
            compact
            onChange={() => setSidecarEnabled(value => !value)}
            checked={isSidecarEnabled}
          />
        )}
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
                onChange={() => setWithMemory(!withMemory)}
                dir="rtl"
              >
                {t('namespaces.create-modal.create-resource-quota')}
              </Checkbox>
              <MemoryPresets
                presets={CONFIG.NS_MEMORY_QUOTAS_PRESET}
                setValue={val => {
                  setMemory(val);
                }}
                disabled={!withMemory}
                namespaceName={namespace.metadata?.name}
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
              disabled={!withMemory}
              required={withMemory}
            />
            <MemoryInput
              label={t('namespaces.overview.resources.requests')}
              container={memory}
              setContainer={setMemory}
              propertyPath='$.spec.hard["requests.memory"]'
              disabled={!withMemory}
              required={withMemory}
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
                onChange={() => setWithLimits(!withLimits)}
                dir="rtl"
              >
                {t('namespaces.create-modal.create-limit-range')}
              </Checkbox>
              <LimitPresets
                presets={CONFIG.NS_CONTAINER_LIMITS_PRESET}
                setValue={val => {
                  setLimits(val);
                }}
                disabled={!withLimits}
                namespaceName={namespace.metadata?.name}
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
              enableResource={setWithLimits}
              disabled={!withLimits}
              required={withLimits}
            />
            <MemoryInput
              label={t('limit-ranges.headers.default')}
              container={limits}
              setContainer={setLimits}
              propertyPath="$.spec.limits[0].default.memory"
              enableResource={setWithLimits}
              disabled={!withLimits}
              required={withLimits}
            />
            <MemoryInput
              label={t('limit-ranges.headers.default-request')}
              container={limits}
              setContainer={setLimits}
              propertyPath="$.spec.limits[0].defaultRequest.memory"
              enableResource={setWithLimits}
              disabled={!withLimits}
              required={withLimits}
            />
          </FormFieldset>
        </ResourceForm.CollapsibleSection>
      ) : null}
    </ResourceForm>
  );
}

NamespaceCreate.allowEdit = true;
