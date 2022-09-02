import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import {
  SimpleContainersView,
  AdvancedContainersView,
} from 'shared/components/Deployment/ContainersViews';

import {
  createContainerTemplate,
  createDeploymentTemplate,
  createPresets,
} from './templates';

import './DeploymentCreate.scss';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Switch } from 'fundamental-react';

const ISTIO_INJECTION_LABEL = 'sidecar.istio.io/inject';
const ISTIO_INJECTION_ENABLED = 'true';

export function DeploymentCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialDeployment,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();

  const [deployment, setDeployment] = useState(
    initialDeployment
      ? _.cloneDeep(initialDeployment)
      : createDeploymentTemplate(namespace),
  );
  const { isIstioFeatureOn, isSidecarEnabled, setSidecarEnabled } = useSidecar(
    initialDeployment,
    deployment,
    setDeployment,
  );

  useEffect(() => {
    const hasAnyContainers = !!(
      jp.value(deployment, '$.spec.template.spec.containers') || []
    ).length;

    setCustomValid(hasAnyContainers);
  }, [deployment, setCustomValid]);

  const handleNameChange = name => {
    jp.value(deployment, '$.metadata.name', name);
    jp.value(deployment, "$.metadata.labels['app.kubernetes.io/name']", name);
    jp.value(deployment, '$.spec.template.spec.containers[0].name', name);
    jp.value(deployment, '$.spec.selector.matchLabels.app', name); // match labels
    jp.value(deployment, '$.spec.template.metadata.labels.app', name); // pod labels
    setDeployment({ ...deployment });
  };

  return (
    <ResourceForm
      {...props}
      pluralKind="deployments"
      singularName={t(`deployments.name_singular`)}
      resource={deployment}
      setResource={setDeployment}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={!initialDeployment && createPresets(namespace, t)}
      onPresetSelected={value => {
        setDeployment(value.deployment);
      }}
      // create modal on a namespace details doesn't have the resourceUrl
      createUrl={resourceUrl}
      initialResource={initialDeployment}
      handleNameChange={handleNameChange}
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

      <SimpleContainersView
        simple
        resource={deployment}
        setResource={setDeployment}
      />

      <AdvancedContainersView
        advanced
        resource={deployment}
        setResource={setDeployment}
        onChange={onChange}
        namespace={namespace}
        createContainerTemplate={createContainerTemplate}
      />
    </ResourceForm>
  );
}
DeploymentCreate.allowEdit = true;

const useSidecar = (initialNamespace, res, setRes) => {
  const { features } = useMicrofrontendContext();
  const isIstioFeatureOn = features?.ISTIO?.isEnabled;

  const [isSidecarEnabled, setSidecarEnabled] = useState(
    initialNamespace
      ? initialNamespace?.spec?.template?.metadata?.annotations?.[
          ISTIO_INJECTION_LABEL
        ] === ISTIO_INJECTION_ENABLED
      : false,
  );

  useEffect(() => {
    // toggles istio-injection label when 'Disable sidecar injection' is clicked
    if (isSidecarEnabled) {
      jp.value(
        res,
        `$.spec.template.metadata.annotations["${ISTIO_INJECTION_LABEL}"]`,
        ISTIO_INJECTION_ENABLED,
      );
      setRes({ ...res });
    } else {
      const annotations = res.spec?.template?.metadata?.annotations;
      if (annotations) {
        delete annotations[ISTIO_INJECTION_LABEL];
        const newRes = { ...res };
        newRes.spec.template.metadata.annotations = annotations;

        setRes(newRes);
      }
    }

    // eslint-disable-next-line
  }, [isSidecarEnabled]);

  useEffect(() => {
    // toggles 'Enable sidecar injection' when istio-injection label is deleted in yaml
    if (
      isSidecarEnabled &&
      jp.value(
        res,
        `$.spec.template.metadata.annotations["${ISTIO_INJECTION_LABEL}"]`,
      ) !== ISTIO_INJECTION_ENABLED
    ) {
      setSidecarEnabled(false);
    }
  }, [isSidecarEnabled, setSidecarEnabled, res]);

  return { isIstioFeatureOn, isSidecarEnabled, setSidecarEnabled };
};
