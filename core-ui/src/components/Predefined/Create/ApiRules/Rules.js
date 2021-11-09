import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { JwtStrategyConfig } from './JwtStrategyConfig';
import { merge } from 'lodash';

const accessStrategyOptions = [
  {
    key: 'allow',
    text: 'Allow',
  },
  {
    key: 'noop',
    text: 'noop',
  },
  {
    key: 'jwt',
    text: 'JWT',
  },
  {
    key: 'oauth2_introspection',
    text: 'OAuth2',
  },
];

const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'].map(
  method => ({
    key: method,
    text: method,
  }),
);

export function RuleForm({ rule, rules, setRules }) {
  const { t } = useTranslation();

  const setRule = newRule => {
    merge(rule, newRule);
    setRules([...rules]);
  };

  return (
    <ResourceForm.Wrapper resource={rule} setResource={setRule}>
      <ResourceForm.FormField
        required
        propertyPath="$.path"
        label={t('api-rules.access-strategies.labels.path')}
        tooltipContent={t('api-rules.access-strategies.tooltips.path')}
        input={Inputs.Text}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.accessStrategies[0].handler"
        label={t('api-rules.access-strategies.labels.handler')}
        input={Inputs.Dropdown}
        options={accessStrategyOptions}
      />
      {/*todo required  */}
      {rule?.accessStrategies?.[0]?.handler === 'oauth2_introspection' && (
        <ResourceForm.TextArrayInput
          required
          propertyPath="$.accessStrategies[0].config.required_scope"
          title={t('Required scope')}
        />
      )}
      {/*todo required  */}
      {rule?.accessStrategies?.[0]?.handler === 'jwt' && (
        <JwtStrategyConfig propertyPath="$.accessStrategies[0].config" />
      )}
      {rule?.accessStrategies?.[0]?.handler !== 'allow' && (
        <ResourceForm.SelectArrayInput
          propertyPath="$.methods"
          placeholder={t('api-rules.placeholders.methods')}
          title={t('api-rules.access-strategies.labels.methods')}
          options={methodOptions}
        />
      )}
    </ResourceForm.Wrapper>
  );
}

export function SingleRuleInput({
  value: rules,
  setValue: setRules,
  defaultOpen,
}) {
  const { t } = useTranslation();

  return (
    <ResourceForm.CollapsibleSection
      title={t('Rules')}
      defaultOpen={defaultOpen}
    >
      <RuleForm rule={rules[0]} rules={rules} setRules={setRules} />
    </ResourceForm.CollapsibleSection>
  );
}
