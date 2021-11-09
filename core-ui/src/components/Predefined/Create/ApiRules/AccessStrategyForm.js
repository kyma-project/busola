import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { JwtStrategyConfig } from './JwtStrategyConfig';
import { merge } from 'lodash';
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
      {/*todo required  */}
      {accessStrategy?.handler === 'oauth2_introspection' && (
        <ResourceForm.TextArrayInput
          required
          propertyPath="$.config.required_scope"
          title={t('Required scope')}
        />
      )}
      {/*todo required  */}
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
          listTitle={t('Access Strategies')} //todo
          nameSingular={t('Access Strategy')} //todo
          atLeastOneRequiredMessage={t(
            //todo
            'dupsko',
          )}
          itemRenderer={({
            item: accessStrategy,
            values: accessStrategies,
            setValues: setAccessStrategies,
          }) => (
            <SingleAccessStrategyInput
              value={accessStrategy}
              setValue={updatedAccessStrategy => {
                merge(accessStrategy, updatedAccessStrategy); // todo
                setAccessStrategies([...accessStrategies]);
              }}
            />
          )}
          newResourceTemplateFn={createAccessStrategyTemplate}
        />
      </>
    </ResourceForm.Wrapper>
  );
}
