import React from 'react';
import { useTranslation } from 'react-i18next';

import { JSONSchema } from './JSONSchema';

export const Generic = ({ val }) => {
  const { t } = useTranslation();

  if (Array.isArray(val)) {
    return val.join(', ');
  } else if (typeof val === 'boolean') {
    return val ? t('common.yes') : t('common.no');
  } else if (typeof val === 'object') {
    return JSON.stringify(val);
  } else {
    return val;
  }
};

export const Schema = ({ val }) => <JSONSchema {...val} />;
Schema.fullWidth = true;

export const SchemaArray = ({ val }) =>
  val.map((schema, index) => <JSONSchema key={index} {...schema} />);
SchemaArray.fullWidth = true;

export const SchemaMap = ({ val, required }) => {
  return (
    <ul>
      {Object.entries(val).map(([name, def]) => (
        <li key={name}>
          <JSONSchema
            name={name}
            {...def}
            isRequired={required?.includes(name)}
          />
        </li>
      ))}
    </ul>
  );
};
SchemaMap.expandable = true;

export const PROPERTIES = {
  // common
  type: null,
  description: null,

  enum: Generic,
  const: Generic,

  dependentSchemas: SchemaMap,
  unevaluatedItems: Schema,
  unevaluatedProperties: Schema,

  // number
  multipleOf: Generic,
  maximum: Generic,
  exclusiveMaximum: Generic,
  minimum: Generic,
  exclusiveMinimum: Generic,

  // array
  maxItems: Generic,
  minItems: Generic,
  uniqueItems: Generic,
  maxContains: Generic,
  minContains: Generic,
  items: Schema,

  // string
  maxLength: Generic,
  minLength: Generic,
  pattern: Generic,

  // object
  dependentRequired: Generic,
  maxProperties: Generic,
  minProperties: Generic,
  required: Generic,
  properties: SchemaMap,
  additionalProperties: Schema,

  // conditionals
  allOf: SchemaArray,
  anyOf: SchemaArray,
  oneOf: SchemaArray,
  not: Schema,

  if: Schema,
  then: Schema,
  else: Schema,
};
