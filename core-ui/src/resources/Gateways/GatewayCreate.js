import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { KeyValueField, ItemArray } from 'shared/ResourceForm/fields';
import * as jp from 'jsonpath';
import { createGatewayTemplate, createPresets, newServer } from './templates';
import { SingleServerForm, SingleServerInput } from './Forms/ServersForm';
import { validateGateway } from './helpers';
import { MessageStrip } from 'fundamental-react';
import { cloneDeep } from 'lodash';

export function GatewayCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialGateway,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();

  const [gateway, setGateway] = useState(
    initialGateway
      ? cloneDeep(initialGateway)
      : createGatewayTemplate(namespace),
  );

  React.useEffect(() => {
    setCustomValid(validateGateway(gateway));
  }, [gateway, setCustomValid]);

  return (
    <ResourceForm
      {...props}
      pluralKind="gateways"
      singularName={t(`gateways.name_singular`)}
      resource={gateway}
      setResource={setGateway}
      initialResource={initialGateway}
      onChange={onChange}
      formElementRef={formElementRef}
      presets={!initialGateway && createPresets(namespace, t)}
      createUrl={resourceUrl}
    >
      <KeyValueField
        defaultOpen
        required={true}
        propertyPath="$.spec.selector"
        title={t('gateways.create-modal.simple.selector')}
        tooltipContent={t('gateways.create-modal.tooltips.selector')}
      />
      {jp.value(gateway, '$.spec.servers.length') ? (
        <SingleServerInput simple propertyPath="$.spec.servers" />
      ) : (
        <MessageStrip simple type="warning" className="fd-margin-top--sm">
          {t('gateways.create-modal.at-least-one-server-required')}
        </MessageStrip>
      )}
      <ItemArray
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
            nestingLevel={1}
          />
        )}
        newResourceTemplateFn={newServer}
      />
    </ResourceForm>
  );
}

GatewayCreate.allowEdit = true;
