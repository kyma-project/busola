import React from 'react';
import { useGet } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { createShootTemplate } from './templates';
import { PROVIDERS, PURPOSES } from './helpers';
import * as jp from 'jsonpath';

function useGetK8sVersions(cloudProfileName) {
  const { data, loading, error } = useGet(
    '/apis/core.gardener.cloud/v1beta1/cloudprofiles',
  );

  const unique = (v, i, arr) => arr.indexOf(v) === i;

  const versions =
    data?.items
      .find(p => p.metadata.name === cloudProfileName)
      ?.spec.kubernetes.versions.map(v => v.version)
      .filter(unique) || [];

  return { versions, loading, error };
}

export function ShootsCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const [shoot, setShoot] = React.useState(createShootTemplate(namespace));
  const { t } = useTranslation();
  const { versions /*loading, error*/ } = useGetK8sVersions(
    shoot?.spec?.cloudProfileName,
  );

  React.useEffect(() => {
    setCustomValid(true);
  }, [shoot, setCustomValid]);

  return (
    <ResourceForm
      pluralKind="shoots" //todo and in dnsProviders
      singularName={t('shoots.name_singular')}
      resource={shoot}
      setResource={setShoot}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={`/apis/core.gardener.cloud/v1beta1/namespaces/${namespace}/shoots/`}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('shoots.name_singular')}
        customSetValue={name => {
          jp.value(shoot, '$.metadata.name', name);
          jp.value(shoot, "$.metadata.labels['app.kubernetes.io/name']", name);
          setShoot({ ...shoot });
        }}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.spec.cloudProfileName"
        label={t('shoots.provider')}
        input={props => (
          <ResourceForm.Select
            fromArray={PROVIDERS}
            onSelect={provider => {
              jp.value(shoot, '$.spec.cloudProfileName', provider);
              jp.value(shoot, '$.spec.provider.type', provider);
              setShoot({ ...shoot });
            }}
            {...props}
          />
        )}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.spec.kubernetes.version"
        label={t('common.headers.version')}
        input={props => <ResourceForm.Select fromArray={versions} {...props} />}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.spec.purpose"
        label={t('shoots.purpose')}
        input={props => <ResourceForm.Select fromArray={PURPOSES} {...props} />}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
    </ResourceForm>
  );
}
