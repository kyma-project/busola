import React from 'react';
import { useTranslation } from 'react-i18next';

import { JSONSchema } from './ObjectField';
import { ObjectProperty } from './ObjectProperty';

const scalar = val => val;
const array = val => val.join(', ');
const schema = val => <JSONSchema {...val} />;
const schemaArray = val => val.map(schema => <JSONSchema {...schema} />);
const schemaMap = (val, required) =>
  Object.entries(val).map(([name, def]) => (
    <ObjectProperty name={name} def={def} required={required} />
  ));
const bool = val => () => {
  const { t } = useTranslation();
  val ? t('common.yes') : t('common.no');
};

const KNOWN_CONSTRAINTS = {
  generic: {
    type: null,

    enum: array,
    const: scalar,

    allOf: schemaArray,
    anyOf: schemaArray,
    oneOf: schemaArray,
    not: schema,

    if: schema,
    then: schema,
    else: schema,

    dependentSchemas: schemaMap,
    unevaluatedItems: schema,
    unevaluatedProperties: schema,
  },
  number: {
    multipleOf: scalar,
    maximum: scalar,
    exclusiveMaximum: scalar,
    minimum: scalar,
    exclusiveMinimum: scalar,
  },
  array: {
    maxItems: scalar,
    minItems: scalar,
    uniqueItems: scalar,
    maxContains: scalar,
    minContains: scalar,
    items: schema,
  },
  string: {
    maxLength: scalar,
    minLength: scalar,
    pattern: scalar,
  },
  object: {
    dependentRequired: bool,
    maxProperties: scalar,
    minProperties: scalar,
    // required: array,
    required: null,
    properties: schemaMap,
    additionalProperties: schema,
  },
  // ignore: ['properties', 'items'],
};

export function Constraints({ for: type, def, withLabel = false }) {
  const { t } = useTranslation();
  console.log('Constraints', def);

  const getValue = key => {
    if (Array.isArray(def[key])) {
      return def[key].join(', ');
    } else if (typeof def[key] === 'boolean') {
      return def[key] ? t('common.yes') : t('common.no');
    } else if (typeof def[key] === 'object') {
      return JSON.stringify(def[key]);
    } else {
      return def[key];
    }
  };

  const allConstraints = Object.values(KNOWN_CONSTRAINTS).flat();
  const constraints = type
    ? KNOWN_CONSTRAINTS[type]
    : Object.keys(def).filter(key => !allConstraints.includes(key));
  const values = constraints.filter(key => typeof def[key] !== 'undefined');
  if (values.length) {
    return (
      <dl>
        {values.map(key => (
          <>
            <dd>{type ? t(`schema.constraints.${key}`) : key}</dd>
            <dt>{getValue(key)}</dt>
          </>
        ))}
      </dl>
    );
  } else {
    return '';
  }
}
