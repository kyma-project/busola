import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Icon } from 'fundamental-react';

import { JSONSchema } from './ObjectField';
import { ObjectProperty } from './ObjectProperty';

// const scalar = val => val;
// const array = val => val.join(', ');
const Generic = ({ val }) => {
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
const Schema = ({ val }) => (
  <dt>
    <JSONSchema {...val} />
  </dt>
);
Schema.expandable = true;

const SchemaArray = ({ val }) =>
  val.map(schema => (
    <dt>
      <JSONSchema {...schema} />
    </dt>
  ));
const SchemaMap = ({ val, required }) => {
  console.log('SchemaMap', { val, required });
  return (
    <ul>
      {Object.entries(val).map(([name, def]) => (
        <li>
          <JSONSchema key={name} name={name} {...def} />
        </li>
      ))}

      {/*
      Object.entries({ val }).map(([name, def]) => (
        <ObjectProperty name={name} def={def} required={required} />
      ));
      */}
    </ul>
  );
};
SchemaMap.expandable = true;
// const bool = val => () => {
// const { t } = useTranslation();
// val ? t('common.yes') : t('common.no');
// };

const KNOWN_CONSTRAINTS = {
  generic: {
    type: null,
    description: null,

    enum: Generic,
    const: Generic,

    allOf: SchemaArray,
    anyOf: SchemaArray,
    oneOf: SchemaArray,
    not: Schema,

    if: Schema,
    then: Schema,
    else: Schema,

    dependentSchemas: SchemaMap,
    unevaluatedItems: Schema,
    unevaluatedProperties: Schema,
  },
  number: {
    multipleOf: Generic,
    maximum: Generic,
    exclusiveMaximum: Generic,
    minimum: Generic,
    exclusiveMinimum: Generic,
  },
  array: {
    maxItems: Generic,
    minItems: Generic,
    uniqueItems: Generic,
    maxContains: Generic,
    minContains: Generic,
    items: Schema,
  },
  string: {
    maxLength: Generic,
    minLength: Generic,
    pattern: Generic,
  },
  object: {
    // dependentRequired: bool,
    dependentRequired: Generic,
    maxProperties: Generic,
    minProperties: Generic,
    // required: array,
    required: null,
    properties: SchemaMap,
    additionalProperties: Schema,
  },
};

function Property({ label, val, handler }) {
  const [collapsed, setCollapsed] = useState(true);
  const Handler = handler;

  console.log('Property', { label, val, handler });

  return (
    <>
      <dd onClick={() => setCollapsed(!collapsed)}>
        {handler.expandable && (
          <Icon
            className="control-icon"
            ariaHidden
            glyph={
              collapsed ? 'navigation-right-arrow' : 'navigation-down-arrow'
            }
          />
        )}{' '}
        {label}
      </dd>
      {(!handler.expandable || !collapsed) && (
        <dt
          className={classNames({
            'full-width': handler.expandable,
          })}
        >
          <Handler val={val} />
        </dt>
      )}
    </>
  );
}

export function Constraints({ type, def, withLabel = false }) {
  const { t } = useTranslation();
  console.log('Constraints', type, def);

  /*
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
  */
  if (!type) {
    const allConstraints = Object.values(KNOWN_CONSTRAINTS)
      .map(group => Object.keys(group))
      .flat();
    return Object.keys(def)
      .filter(key => !allConstraints.includes(key))
      .map(key => <Property label={key} handler={Generic} val={def[key]} />);
  } else if (!KNOWN_CONSTRAINTS[type]) {
    return '';
  }

  const entries = Object.entries(KNOWN_CONSTRAINTS[type] || {}) || [];
  console.log('constraints', entries);
  console.log(
    'constraints with handler',
    entries.filter(([key, handler]) => !!handler),
  );
  console.log(
    'constraints with value',
    entries
      .filter(([key, handler]) => !!handler)
      .filter(([key]) => Object.keys(def).includes(key)),
  );
  return (
    <>
      {entries
        .filter(([key, handler]) => !!handler)
        .filter(([key]) => Object.keys(def).includes(key))
        .map(([key, handler]) => (
          <Property
            label={t(`schema.fields.${key}`)}
            handler={handler}
            val={def[key]}
          />
        ))}
    </>
  );
  /*<>
      <dd>{t(`schema.constraints.${key}`)}</dd>
      <dt className={classNames({
        'full-width': handler.expandable,
      })}><handler val={def[key]} /></dt>
    </>*/

  // const allConstraints = Object.values(KNOWN_CONSTRAINTS).flat();
  // const constraints = type
  // ? KNOWN_CONSTRAINTS[type]
  // : Object.keys(def).filter(key => !allConstraints.includes(key));
  /*
  const values = constraints.filter(key => typeof def[key] !== 'undefined');
  if (values.length) {
    return (
      {values.map(key => (
        <>
          <dd>{type ? t(`schema.constraints.${key}`) : key}</dd>
          <dt>{getValue(key)}</dt>
        </>
      ))}
    );
  } else {
    return '';
  }
  */
}
