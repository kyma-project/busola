import React from 'react';
import { useUIStore } from '@ui-schema/ui-schema';

import { useJsonata } from '../../hooks/useJsonata';
import { useVariables } from '../../hooks/useVariables';
import { fromJS } from 'immutable';
import { ComboboxInput, MessageStrip, Checkbox } from 'fundamental-react';

import './Modules.scss';

export function Modules({
  storeKeys,
  resource,
  onChange,
  schema,
  required,
  editMode,
}) {
  // console.log(
  //   storeKeys.toJS(),
  //   resource,
  //   onChange,
  //   schema.toJS(),
  //   required,
  //   editMode,
  // );
  const setCheckbox = (fullValue, key, entryValue, checked, index) => {
    console.log(checked);
    if (checked) {
      onChange({
        storeKeys,
        scopes: ['value', 'internal'],
        type: 'list-item-add',
        schema,
        itemValue: fromJS({ [key]: entryValue }),
        required,
      });
    } else {
      onChange({
        storeKeys,
        scopes: ['value', 'internal'],
        type: 'list-item-delete',
        index,
        schema,
        required,
      });
    }
  };
  const { store } = useUIStore();
  const { value } = store?.extractValues(storeKeys) || [];
  const { itemVars } = useVariables();
  const jsonata = useJsonata({
    resource,
    scope: value,
    value,
  });

  const rule = schema.get('schemaRule');

  const options = schema.get('options');
  let parsedOptions = {};

  function makeJsonata(propObject) {
    if (typeof propObject === 'string') {
      const [newEnum] = jsonata(
        propObject,
        itemVars(resource, rule.itemVars, storeKeys),
        [],
      );
      return newEnum;
    }
    console.warn('Widget::Modules');
    return null;
  }

  Object.keys(options).forEach(optionName => {
    parsedOptions[optionName] = makeJsonata(options[optionName]);
  });

  const Items = parsedOptions?.name?.map((name, index) => {
    const isChecked = !!(value ? value.toJS() : []).find(v => {
      console.log(v);
      return v.name === name;
    });

    let channelTest = [];

    parsedOptions?.moduleTemplates?.map(moduleTemplate => {
      if (
        moduleTemplate?.metadata?.labels[
          'operator.kyma-project.io/module-name'
        ] === name
      ) {
        if (moduleTemplate?.spec?.descriptor?.component?.version)
          return channelTest.push({
            text: moduleTemplate.spec.channel,
            additionalText: `(version: ${moduleTemplate?.spec?.descriptor?.component?.version})`,
          });

        return channelTest.push({
          text: moduleTemplate.spec.channel,
          additionalText: '',
        });
      } else {
        return '';
      }
    });

    const link = parsedOptions?.moduleTemplates?.find(moduleTemplate => {
      const channel = resource?.spec?.modules
        ? resource?.spec?.modules[index]?.channel ?? resource?.spec?.channel
        : null;
      if (
        moduleTemplate?.metadata?.labels[
          'operator.kyma-project.io/module-name'
        ] === name &&
        moduleTemplate?.spec?.channel === channel
      )
        return moduleTemplate;
      else return null;
    })?.metadata?.annotations['operator.kyma-project.io/doc-url'];

    return (
      <>
        <div className="flexbox">
          <Checkbox
            key={name}
            value={name}
            checked={isChecked}
            onChange={e => {
              console.log(e);
              setCheckbox(value, 'name', name, e.target.checked, index);
            }}
          >
            {name}
          </Checkbox>
          <ComboboxInput
            disabled={!isChecked}
            options={channelTest.map(option => {
              return {
                text: `${option.text} ${option.additionalText}`,
                key: option.text,
              };
            })}
            selectedKey={
              resource?.spec?.modules
                ? resource?.spec?.modules[index]?.channel
                : ''
            }
            onSelectionChange={(_, selected) => {
              if (selected.key !== -1) {
                const xd = selected.key;
                onChange({
                  storeKeys: storeKeys.push(index).push('channel'),
                  scopes: ['value'],
                  type: 'set',
                  schema,
                  data: { value: xd },
                  required,
                });
              }
            }}
          />
        </div>
        {/* beta */}
        {link && isChecked ? (
          <MessageStrip type="information" className="fd-margin-bottom--sm">
            Link to documentation: <a href={link}>DOCUMENTATION</a>
          </MessageStrip>
        ) : null}
        {/* docs link*/}
      </>
    );
  });

  return <div>{Items}</div>;
}
