import React from 'react';
import ReactDOM from 'react-dom';
import { useUIStore } from '@ui-schema/ui-schema';

import { useJsonata } from '../../hooks/useJsonata';
import { useVariables } from '../../hooks/useVariables';
import {
  CheckBox,
  ComboBox,
  ComboBoxItem,
  FlexBox,
} from '@ui5/webcomponents-react';
import { fromJS } from 'immutable';

export function Modules({
  storeKeys,
  resource,
  onChange,
  schema,
  required,
  editMode,
}) {
  const setCheckbox = (fullValue, key, entryValue, checked, index) => {
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
      return v.name === name;
    });

    return (
      <FlexBox
        alignItems="Center"
        direction="Row"
        justifyContent="SpaceBetween"
        wrap="Wrap"
        fitContainer
      >
        <CheckBox
          text={name}
          checked={isChecked}
          onChange={e => {
            setCheckbox(value, 'name', e.target.text, e.target.checked, index);
          }}
        />
        <ComboBox readonly={isChecked}>
          <ComboBoxItem text="Item 1" />
        </ComboBox>
        {/* beta */}
        {/* docs link*/}
      </FlexBox>
    );
  });

  return <div>{Items}</div>;
}
