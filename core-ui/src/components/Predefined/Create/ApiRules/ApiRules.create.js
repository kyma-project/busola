import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

import { createApiRuleTemplate, createRuleTemplate } from './templates';
import { useServicesQuery, ServiceDropdown } from './ServiceDropdown';
import { useGatewaysQuery, GatewayDropdown } from './GatewayDropdown';
import { HostAndSubdomain } from './HostDropdown';
import { RuleForm, SingleRuleInput } from './Rules';

export function ApiRulesCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const { t } = useTranslation();
  const servicesQuery = useServicesQuery(namespace);
  const gatewaysQuery = useGatewaysQuery(namespace);
  const [subdomain, setSubdomain] = useState('');
  const [apiRule, setApiRule] = useState(createApiRuleTemplate(namespace));

  useEffect(() => {
    const hasValidService =
      jp.value(apiRule, '$.spec.service.name') &&
      jp.value(apiRule, '$.spec.service.port');

    setCustomValid(hasValidService);
  }, [apiRule, setCustomValid]);

  const handleNameChange = name => {
    jp.value(apiRule, '$.metadata.name', name);
    jp.value(apiRule, "$.metadata.labels['app.kubernetes.io/name']", name);

    setApiRule({ ...apiRule });
  };

  return (
    <ResourceForm
      pluralKind="apirules"
      singularName={t(`api-rules.name_singular`)}
      resource={apiRule}
      setResource={setApiRule}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={`/apis/gateway.kyma-project.io/v1alpha1/namespaces/${namespace}/apirules`}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('api-rules.name_singular')}
        setValue={handleNameChange}
      />
      <ServiceDropdown
        propertyPath="$.spec.service"
        servicesQuery={servicesQuery}
      />
      <GatewayDropdown
        propertyPath="$.spec.gateway"
        gatewaysQuery={gatewaysQuery}
      />
      <HostAndSubdomain
        subdomain={subdomain}
        setSubdomain={setSubdomain}
        propertyPath="$.spec.service.host"
        gatewayStr={jp.value(apiRule, '$.spec.gateway')}
        gatewaysQuery={gatewaysQuery}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />

      <SingleRuleInput simple defaultOpen propertyPath="$.spec.rules" />
      <ResourceForm.ItemArray
        advanced
        propertyPath="$.spec.rules"
        listTitle={t('Rules')} //todo
        nameSingular={t('Rule')} //todo
        atLeastOneRequiredMessage={t(
          //todo
          'gateways.create-modal.at-least-one-server-required',
        )}
        itemRenderer={({ item, values, setValues }) => (
          <RuleForm
            rule={item}
            rules={values}
            setRules={setValues}
            isAdvanced
          />
        )}
        newResourceTemplateFn={createRuleTemplate}
      />
    </ResourceForm>
  );
}
