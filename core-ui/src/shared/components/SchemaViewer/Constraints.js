import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const KNOWN_CONSTRAINTS = {
  generic: ['enum', 'const'],
  number: [
    'multipleOf',
    'maximum',
    'exclusiveMaximum',
    'minimum',
    'exclusiveMinimum',
  ],
  array: ['maxItems', 'minItems', 'uniqueItems', 'maxContains', 'minContains'],
  string: ['maxLength', 'minLength', 'pattern'],
  object: ['dependentRequired', 'maxProperties', 'minProperties', 'required'],
  ignore: ['properties', 'items'],
};

export function Constraints({ for: type, def, withLabel = false }) {
  const { t } = useTranslation();
  console.log('Constraints', def);

  const getValue = key => {
    if (Array.isArray(def[key])) {
      return def[key].join(', ');
    } else if (typeof def[key] === 'boolean') {
      return def[key] ? t('common.yes') : t('common.no');
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
