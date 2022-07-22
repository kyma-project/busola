import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';

import { useNotification } from 'shared/contexts/NotificationContext';
import { ResourceForm } from 'shared/ResourceForm';
import { ItemArray } from 'shared/ResourceForm/fields';

import { createApiRuleTemplate, createRuleTemplate } from './templates';
import { useServicesQuery, ServiceDropdown } from './ServiceDropdown';
import { useGatewaysQuery, GatewayDropdown } from './GatewayDropdown';
import { HostAndSubdomain } from './HostAndSubdomain';
import { RuleForm, SingleRuleInput } from './Rules';
import {
  findGateway,
  getGatewayHosts,
  hasWildcard,
  validateApiRule,
} from './helpers';

export function APIRuleCreate({
  formElementRef,
  namespace,
  onChange,
  resource: initialApiRule,
  resourceUrl,
  setCustomValid,
  serviceName,
  prefix,
  ...props
}) {
  const { t } = useTranslation();
  // queries are moved up here so that the network calls are not doubled
  const servicesQuery = useServicesQuery(namespace);
  const gatewaysQuery = useGatewaysQuery(namespace);
  const notification = useNotification();

  const [subdomain, setSubdomain] = useState('');
  const [apiRule, setApiRule] = useState(
    cloneDeep(initialApiRule) || createApiRuleTemplate(namespace),
  );

  // validation
  useEffect(() => {
    setCustomValid(validateApiRule(apiRule));
  }, [apiRule, setCustomValid]);

  // preselect service name when services list loads
  useEffect(() => {
    if (servicesQuery.data && serviceName) {
      const service = servicesQuery.data.find(
        svc => svc.metadata.name === serviceName,
      );
      if (service) {
        jp.value(apiRule, '$.spec.service.name', serviceName);
        jp.value(apiRule, '$.spec.service.port', service.spec.ports[0]?.port);
        setApiRule({ ...apiRule });
      }
    }
  }, [servicesQuery.loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // set first available host when gateway changes
  useEffect(() => {
    const gateway = findGateway(apiRule?.spec?.gateway, gatewaysQuery.data);
    const firstAvailableHost = gateway && getGatewayHosts(gateway)[0];
    if (firstAvailableHost) {
      jp.value(
        apiRule,
        '$.spec.service.host',
        hasWildcard(firstAvailableHost)
          ? firstAvailableHost.replace('*', subdomain)
          : firstAvailableHost,
      );
      setApiRule({ ...apiRule });
    }
  }, [apiRule?.spec?.gateway]); // eslint-disable-line react-hooks/exhaustive-deps

  const afterCreatedFn = async defaultAfterCreatedFn => {
    if (!serviceName) {
      defaultAfterCreatedFn();
    } else {
      notification.notifySuccess({
        content: t(
          initialApiRule
            ? 'common.create-form.messages.patch-success'
            : 'common.create-form.messages.create-success',
          {
            resourceType: t(`api-rules.name_singular`),
          },
        ),
      });
    }
  };

  return (
    <ResourceForm
      {...props}
      pluralKind="apirules"
      singularName={t(`api-rules.name_singular`)}
      resource={apiRule}
      initialResource={initialApiRule}
      setResource={setApiRule}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      afterCreatedFn={afterCreatedFn}
      setCustomValid={setCustomValid}
      nameProps={{ prefix: prefix }}
    >
      <ServiceDropdown
        propertyPath="$.spec.service"
        servicesQuery={servicesQuery}
        preselectServiceName={serviceName}
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

      <SingleRuleInput simple defaultOpen propertyPath="$.spec.rules" />
      <ItemArray
        advanced
        propertyPath="$.spec.rules"
        listTitle={t('api-rules.rules')}
        nameSingular={t('api-rules.rule')}
        atLeastOneRequiredMessage={t('api-rules.messages.one-rule-required')}
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

APIRuleCreate.allowEdit = true;
