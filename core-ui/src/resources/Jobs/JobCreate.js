import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { Switch } from 'fundamental-react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';

import { createJobTemplate, createJobPresets } from './templates';
import { JobSpecSection } from './SpecSection';
import { ContainerSection, ContainersSection } from './ContainersSection';
import { MessageStrip } from 'fundamental-react';

const SIDECAR_INJECTION_LABEL = 'sidecar.istio.io/inject';
const SIDECAR_INJECTION_VALUE = 'false';

function isJobValid(job) {
  const isNameValid = jp.value(job, '$.metadata.name');

  const containers = jp.value(job, '$.spec.template.spec.containers') || [];

  const areContainersValid = !!containers.length;

  return isNameValid && areContainersValid;
}

export function JobCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialJob,
  resourceUrl,
  prefix,
}) {
  const { t } = useTranslation();
  const { features } = useMicrofrontendContext();
  const istioEnabled = features.ISTIO?.isEnabled;
  const defaultSidecarAnnotations = initialJob
    ? initialJob?.spec.template.metadata.annotations
    : istioEnabled
    ? { [SIDECAR_INJECTION_LABEL]: SIDECAR_INJECTION_VALUE }
    : {};

  const [job, setJob] = useState(
    initialJob
      ? cloneDeep(initialJob)
      : createJobTemplate(namespace, defaultSidecarAnnotations),
  );

  useEffect(() => {
    setCustomValid(isJobValid(job));
  }, [job, setCustomValid]);

  const onSwitchChange = () => {
    const isSidecar =
      jp.value(
        job,
        `$.spec.template.metadata.annotations["${SIDECAR_INJECTION_LABEL}"]`,
      ) !== SIDECAR_INJECTION_VALUE;
    if (isSidecar) {
      jp.value(
        job,
        `$.spec.template.metadata.annotations["${SIDECAR_INJECTION_LABEL}"]`,
        SIDECAR_INJECTION_VALUE,
      );
      setJob({ ...job });
    } else {
      const templateAnnotations =
        job.spec.template?.metadata?.annotations || {};
      delete templateAnnotations[SIDECAR_INJECTION_LABEL];

      jp.value(
        job,
        '$.spec.template.metadata.annotations',
        templateAnnotations,
      );

      setJob({ ...job });
    }
  };

  return (
    <ResourceForm
      pluralKind="jobs"
      singularName={t(`jobs.name_singular`)}
      resource={job}
      setResource={setJob}
      initialResource={initialJob}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={createJobPresets(namespace, t)}
      createUrl={resourceUrl}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('jobs.name_singular')}
        setValue={name => {
          jp.value(job, '$.metadata.name', name);
          jp.value(job, "$.metadata.labels['app.kubernetes.io/name']", name);
          setJob({ ...job });
        }}
        readOnly={!!initialJob}
        prefix={prefix}
      />
      <ResourceForm.FormField
        label={t('jobs.create-modal.disable-sidecar')}
        input={() => (
          <Switch
            compact
            onChange={onSwitchChange}
            checked={
              jp.value(
                job,
                `$.spec.template.metadata.annotations["${SIDECAR_INJECTION_LABEL}"]`,
              ) === SIDECAR_INJECTION_VALUE
            }
          />
        )}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />

      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />

      <JobSpecSection advanced propertyPath="$.spec" readOnly={!!initialJob} />

      <ContainerSection
        simple
        propertyPath="$.spec.template.spec.containers"
        readOnly={!!initialJob}
        prefix={prefix}
      />

      <ContainersSection
        advanced
        propertyPath="$.spec.template.spec.containers"
        readOnly={!!initialJob}
      />

      <MessageStrip type="information" className="fd-margin-top--sm">
        {t('jobs.create-modal.containers-readonly-in-edit')}
      </MessageStrip>
    </ResourceForm>
  );
}
JobCreate.allowEdit = true;
