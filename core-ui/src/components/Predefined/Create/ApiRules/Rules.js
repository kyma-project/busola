import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { AccessStrategyForm } from './AccessStrategyForm';

const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'].map(
  method => ({
    key: method,
    text: method,
  }),
);

export function RuleForm({ rule, rules, setRules, isAdvanced }) {
  const { t } = useTranslation();

  return (
    <ResourceForm.Wrapper
      resource={rule}
      setResource={() => setRules([...rules])}
      isAdvanced={isAdvanced}
    >
      <ResourceForm.FormField
        required
        propertyPath="$.path"
        label={t('api-rules.access-strategies.labels.path')}
        tooltipContent={t('api-rules.access-strategies.tooltips.path')}
        input={Inputs.Text}
        placeholder={t('api-rules.placeholders.path')}
        pattern="^[a-z0-9\/\(\)\?.!*\-]+"
      />
      <AccessStrategyForm />
      <ResourceForm.SelectArrayInput
        propertyPath="$.methods"
        placeholder={t('api-rules.placeholders.methods')}
        title={t('api-rules.access-strategies.labels.methods')}
        options={methodOptions}
      />
    </ResourceForm.Wrapper>
  );
}

export function SingleRuleInput({
  value: rules,
  setValue: setRules,
  defaultOpen,
  isAdvanced,
}) {
  const { t } = useTranslation();

  return (
    <ResourceForm.CollapsibleSection
      title={t('api-rules.rules')}
      defaultOpen={defaultOpen}
    >
      <RuleForm
        rule={rules[0]}
        rules={rules}
        setRules={setRules}
        isAdvanced={isAdvanced}
      />
    </ResourceForm.CollapsibleSection>
  );
}
