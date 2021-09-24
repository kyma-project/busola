import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { createShootTemplate } from './templates';
import * as jp from 'jsonpath';

export function ShootsCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const [shoot, setShoot] = React.useState(createShootTemplate(namespace));
  const { t } = useTranslation();

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
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        label={t('common.headers.labels')}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        label={t('common.headers.annotations')}
      />
    </ResourceForm>
  );
}
