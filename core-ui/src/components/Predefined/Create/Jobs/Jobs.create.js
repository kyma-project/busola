import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { Switch } from 'fundamental-react';
import { useMicrofrontendContext } from 'react-shared';

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

function JobsCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialJob,
  resourceUrl,
}) {
  const { t } = useTranslation();
  const { features } = useMicrofrontendContext();
  const istioEnabled = features.ISTIO?.isEnabled;

  const [job, setJob] = useState(
    initialJob ? cloneDeep(initialJob) : createJobTemplate(namespace),
  );
  const [isSidecar, setSidecar] = useState(
    initialJob
      ? initialJob?.spec.template.metadata.annotations?.[
          SIDECAR_INJECTION_LABEL
        ]
      : istioEnabled,
  );

  useEffect(() => {
    setCustomValid(isJobValid(job));
  }, [job, setCustomValid]);

  useEffect(() => {
    // toggles istio-injection label when 'Disable sidecar injection' is clicked
    if (isSidecar) {
      jp.value(
        job,
        `$.spec.template.metadata.annotations["${SIDECAR_INJECTION_LABEL}"]`,
        SIDECAR_INJECTION_VALUE,
      );
      setJob({ ...job });
    } else {
      const templateAnnotations = job.spec.template.metadata.annotations || {};
      delete templateAnnotations[SIDECAR_INJECTION_LABEL];
      setJob({
        ...job,
        spec: {
          ...job.spec,
          template: {
            ...job.spec.template,
            metadata: {
              ...job.spec.template.metadata,
              annotations: templateAnnotations,
            },
          },
        },
      });
    }
    // eslint-disable-next-line
  }, [isSidecar]);

  useEffect(() => {
    // toggles 'Disable sidecar injection' when istio-injection label is deleted manually
    if (
      isSidecar &&
      jp.value(
        job,
        `$.spec.template.metadata.annotations["${SIDECAR_INJECTION_LABEL}"]`,
      ) !== SIDECAR_INJECTION_VALUE
    ) {
      setSidecar(false);
    }
  }, [isSidecar, setSidecar, job]);

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
      />
      <ResourceForm.FormField
        label={t('jobs.create-modal.disable-sidecar')}
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
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />

      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
        lockedKeys={[SIDECAR_INJECTION_LABEL]}
        lockedValues={[SIDECAR_INJECTION_LABEL]}
      />

      <JobSpecSection advanced propertyPath="$.spec" readOnly={!!initialJob} />

      <ContainerSection
        simple
        propertyPath="$.spec.template.spec.containers"
        readOnly={!!initialJob}
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
JobsCreate.allowEdit = true;
export { JobsCreate };
