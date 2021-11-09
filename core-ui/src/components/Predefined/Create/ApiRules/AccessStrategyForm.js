import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { JwtStrategyConfig } from './JwtStrategyConfig';
import { createAccessStrategyTemplate } from './templates';

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

function SingleAccessStrategyInput({
  value: accessStrategy,
  setValue: setAccessStrategy,
}) {
  const { t } = useTranslation();

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
      />
      {accessStrategy?.handler === 'oauth2_introspection' && (
        <ResourceForm.TextArrayInput
          required
          propertyPath="$.config.required_scope"
          title={t('Required scope')}
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
      <>
        <SingleAccessStrategyInput
          simple
          propertyPath="$.accessStrategies[0]"
        />
        <ResourceForm.ItemArray
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
      </>
    </ResourceForm.Wrapper>
  );
}
