import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';
import { CheckBox, FlexBox } from '@ui5/webcomponents-react';

import * as Inputs from 'shared/ResourceForm/inputs';
import { ResourceForm } from 'shared/ResourceForm';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import { createLimitRangeTemplate } from 'resources/LimitRanges/templates';
import { createResourceQuotaTemplate } from 'resources/ResourceQuotas/templates';

import { MemoryInput } from './MemoryQuotas';
import { createNamespaceTemplate } from './templates';
import { LimitPresets, MemoryPresets } from './Presets';
import { useSidecar } from 'shared/hooks/useSidecarInjection';
import { CONFIG } from './config';
import { useUrl } from 'hooks/useUrl';
import { useNavigate } from 'react-router-dom';

import './NamespaceCreate.scss';
import { useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';

const ISTIO_INJECTION_LABEL = 'istio-injection';
const ISTIO_INJECTION_ENABLED = 'enabled';
const ISTIO_INJECTION_DISABLED = 'disabled';

export default function NamespaceCreate({
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
  const { clusterUrl } = useUrl();
  const navigate = useNavigate();

  const [namespace, setNamespace] = useState(
    initialNamespace ? cloneDeep(initialNamespace) : createNamespaceTemplate(),
  );
  const [initialUnchangedResource] = useState(initialNamespace);

  const {
    isIstioFeatureOn,
    isSidecarEnabled,
    setSidecarEnabled,
    setIsChanged,
  } = useSidecar({
    initialRes: initialUnchangedResource,
    res: namespace,
    setRes: setNamespace,
    path: '$.metadata.labels',
    label: ISTIO_INJECTION_LABEL,
    enabled: ISTIO_INJECTION_ENABLED,
    disabled: ISTIO_INJECTION_DISABLED,
  });

  // container limits
  const [withLimits, setWithLimits] = useState(false);
  const [limits, setLimits] = useState(createLimitRangeTemplate({}));
  // memory quotas
  const [withMemory, setWithMemory] = useState(false);
  const [memory, setMemory] = useState(createResourceQuotaTemplate({}));

  const setLayoutColumn = useSetRecoilState(columnLayoutState);

  const createLimitResource = useCreateResource({
    singularName: 'LimitRange',
    pluralKind: 'LimitRanges',
    resource: limits,
    initialResource: null,
    initialUnchangedResource: null,
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
    setLayoutColumn({
      layout: 'OneColumn',
      showCreate: null,
      midColumn: null,
      endColumn: null,
    });

    if (!initialUnchangedResource) {
      navigate(clusterUrl(`namespaces/${namespace.metadata?.name}`));
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
          initialUnchangedResource ? 'edited' : 'created'
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

  if (!initialNamespace) {
    initialNamespace = createNamespaceTemplate();
  }

  const renderEditor = ({ defaultEditor, Editor }) => (
    <div>
      <ResourceForm.CollapsibleSection
        title={t('namespaces.name_singular')}
        defaultOpen
        resource={namespace}
        setResource={setNamespace}
        className="namespaces-name-yaml"
      >
        {defaultEditor}
      </ResourceForm.CollapsibleSection>
      {!initialUnchangedResource && withLimits ? (
        <ResourceForm.CollapsibleSection
          title={t('namespaces.create-modal.container-limits')}
        >
          <Editor
            value={limits}
            setValue={setLimits}
            updateValueOnParentChange
            schemaId="v1/LimitRange"
          />
        </ResourceForm.CollapsibleSection>
      ) : null}
      {!initialUnchangedResource && withMemory ? (
        <ResourceForm.CollapsibleSection
          title={t('namespaces.create-modal.memory-quotas')}
        >
          <Editor
            value={memory}
            setValue={setMemory}
            updateValueOnParentChange
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
      renderEditor={!initialUnchangedResource ? renderEditor : null}
      resource={namespace}
      setResource={setNamespace}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      initialResource={initialNamespace}
      initialUnchangedResource={initialUnchangedResource}
      afterCreatedFn={afterNamespaceCreated}
      setCustomValid={setCustomValid}
      labelsProps={{
        lockedKeys: [ISTIO_INJECTION_LABEL],
        lockedValues: [ISTIO_INJECTION_LABEL],
      }}
      className="namespace-create"
    >
      {isIstioFeatureOn ? (
        <ResourceForm.FormField
          label={t('namespaces.create-modal.enable-sidecar')}
          input={Inputs.Switch}
          checked={isSidecarEnabled}
          onChange={() => {
            setSidecarEnabled(value => !value);
            setIsChanged(true);
          }}
        />
      ) : null}

      {!initialUnchangedResource ? (
        <ResourceForm.CollapsibleSection
          title={t('namespaces.create-modal.apply-memory-quotas')}
          actions={() => (
            <div className="additional-resource">
              <CheckBox
                checked={withMemory}
                onChange={() => setWithMemory(!withMemory)}
                dir="rtl"
                text={t('namespaces.create-modal.create-resource-quota')}
              />
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
          <FlexBox className="container-limits">
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
          </FlexBox>
        </ResourceForm.CollapsibleSection>
      ) : null}
      {!initialUnchangedResource ? (
        <ResourceForm.CollapsibleSection
          title={t('namespaces.create-modal.apply-limits')}
          actions={() => (
            <div className="additional-resource">
              <CheckBox
                checked={withLimits}
                onChange={() => setWithLimits(!withLimits)}
                dir="rtl"
                text={t('namespaces.create-modal.create-limit-range')}
              />
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
          <FlexBox className="container-limits">
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
          </FlexBox>
        </ResourceForm.CollapsibleSection>
      ) : null}
    </ResourceForm>
  );
}
