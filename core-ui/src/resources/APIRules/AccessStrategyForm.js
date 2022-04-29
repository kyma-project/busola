import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { TextArrayInput, ItemArray } from 'shared/ResourceForm/fields';
import { JwtStrategyConfig } from './JwtStrategyConfig';
import { createAccessStrategyTemplate } from './templates';
import * as jp from 'jsonpath';

const accessStrategies = ['allow', 'noop', 'jwt', 'oauth2_introspection'];

function SingleAccessStrategyInput({
  value: accessStrategy,
  setValue: setAccessStrategy,
}) {
  const { t } = useTranslation();

  const accessStrategyOptions = accessStrategies.map(aS => ({
    key: aS,
    text: t(`api-rules.access-strategies.labels.${aS}`),
  }));

  return (
    <ResourceForm.Wrapper
      resource={accessStrategy}
      setResource={setAccessStrategy}
    >
      <ResourceForm.FormField
        required
        propertyPath="$.handler"
        label={t('api-rules.access-strategies.labels.handler')}
        input={Inputs.Dropdown}
        options={accessStrategyOptions}
        setValue={handler => {
          jp.value(accessStrategy, '$.config', undefined);
          jp.value(accessStrategy, '$.handler', handler);
          setAccessStrategy({ ...accessStrategy });
        }}
      />
      {accessStrategy?.handler === 'oauth2_introspection' && (
        <TextArrayInput
          propertyPath="$.config.required_scope"
          title={t('api-rules.oauth.required-scope')}
          inputProps={{
            placeholder: t('api-rules.oauth.required-scope'),
          }}
        />
      )}
      {accessStrategy?.handler === 'jwt' && (
        <JwtStrategyConfig propertyPath="$.config" />
      )}
    </ResourceForm.Wrapper>
  );
}

export function AccessStrategyForm(props) {
  const { t } = useTranslation();

  return (
    <ResourceForm.Wrapper {...props}>
      <SingleAccessStrategyInput simple propertyPath="$.accessStrategies[0]" />
      <ItemArray
        advanced
        propertyPath="$.accessStrategies"
        listTitle={t('api-rules.access-strategies.title')}
        nameSingular={t('api-rules.access-strategies.labels.access-strategy')}
        atLeastOneRequiredMessage={t(
          'api-rules.access-strategies.messages.one-strategy-required',
        )}
        itemRenderer={({
          item: accessStrategy,
          values: accessStrategies,
          setValues: setAccessStrategies,
        }) => (
          <SingleAccessStrategyInput
            value={accessStrategy}
            setValue={() => setAccessStrategies([...accessStrategies])}
          />
        )}
        newResourceTemplateFn={createAccessStrategyTemplate}
      />
    </ResourceForm.Wrapper>
  );
}
