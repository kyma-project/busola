import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as jp from 'jsonpath';
import { createGatewayTemplate, createPresets, newServer } from './templates';
import { SingleServerForm, SingleServerInput } from './Forms/ServersForm';
import { validateGateway } from './helpers';
import { MessageStrip } from 'fundamental-react';

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

  const selectorField = () => {
    const commonProps = {
      required: true,
      propertyPath: '$.spec.selector',
      title: t('gateways.create-modal.simple.selector'),
      tooltipContent: t('gateways.create-modal.tooltips.selector'),
    };
    return (
      <>
        <ResourceForm.KeyValueField simple defaultOpen {...commonProps} />
        <ResourceForm.KeyValueField advanced {...commonProps} />
      </>
    );
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
        setValue={handleNameChange}
        className="fd-margin-bottom--sm"
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
      {selectorField()}
      {jp.value(gateway, '$.spec.servers.length') ? (
        <SingleServerInput simple propertyPath="$.spec.servers" />
      ) : (
        <MessageStrip simple type="warning" className="fd-margin-top--sm">
          {t('gateways.create-modal.at-least-one-server-required')}
        </MessageStrip>
      )}
      <ResourceForm.ItemArray
        advanced
        propertyPath="$.spec.servers"
        listTitle={t('gateways.create-modal.simple.servers')}
        nameSingular={t('gateways.create-modal.simple.server')}
        entryTitle={server => server?.port?.name}
        atLeastOneRequiredMessage={t(
          'gateways.create-modal.at-least-one-server-required',
        )}
        itemRenderer={({ item, values, setValues, isAdvanced }) => (
          <SingleServerForm
            server={item}
            servers={values}
            setServers={setValues}
            isAdvanced={isAdvanced}
          />
        )}
        newResourceTemplateFn={newServer}
      />
    </ResourceForm>
  );
}
