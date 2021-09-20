import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from '../../../../shared/ResourceForm/ResourceForm';
import * as jp from 'jsonpath';
import { createGatewayTemplate, createPresets, newServer } from './templates';
import { SingleServerForm, SingleServerInput } from './ServersForm';
import { validateGateway } from './helpers';

export function GatewaysCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const { t } = useTranslation();

  const [gateway, setGateway] = useState(createGatewayTemplate(namespace));

  React.useEffect(() => {
    setCustomValid(validateGateway(gateway));
  }, [gateway, setCustomValid]);

  const handleNameChange = name => {
    jp.value(gateway, '$.metadata.name', name);
    jp.value(gateway, "$.metadata.labels['app.kubernetes.io/name']", name);

    setGateway({ ...gateway });
  };

  return (
    <ResourceForm
      pluralKind="gateways"
      singularName={t(`gateways.name_singular`)}
      resource={gateway}
      setResource={setGateway}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={createPresets(namespace, t)}
      createUrl={`/apis/networking.istio.io/v1alpha3/namespaces/${namespace}/gateways/`}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('gateways.name_singular')}
        customSetValue={handleNameChange}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        label={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        label={t('common.headers.annotations')}
      />
      <ResourceForm.KeyValueField
        required
        propertyPath="$.spec.selector"
        label={t('gateways.create-modal.simple.selector')}
      />
      <SingleServerInput simple propertyPath="$.spec.servers" />
      <ResourceForm.ItemArray
        advanced
        propertyPath="$.spec.servers"
        listTitle="Servers"
        nameSingular="Server"
        atLeastOneRequiredMessage="gateway must have at least one server"
        itemRenderer={(current, allValues, setAllValues) => (
          <SingleServerForm
            server={current}
            servers={allValues}
            setServers={setAllValues}
          />
        )}
        newResourceTemplateFn={newServer}
      />
    </ResourceForm>
  );
}
