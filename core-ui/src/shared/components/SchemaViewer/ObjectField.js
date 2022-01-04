import React from 'react';

// import { ObjectProperty } from './ObjectProperty';
import { Constraints } from './Constraints';

export function JSONSchema({
  root = false,
  type,
  name,
  description,
  ...def
  // description,
  // properties,
  // patternProperties,
  // required,
  // propertyNames,
}) {
  const types = Array.isArray(type) ? type : [type];
  console.log('JSONSchema', {
    root,
    type,
    name,
    description,
    types,
  });
  return (
    <section className="object-details">
      {!root && (
        <div>
          {name && (
            <>
              <span className="property-name">{name}</span>:{' '}
            </>
          )}
          {types
            .map(type => {
              if (type !== 'array') {
                return type;
              } else if (Array.isArray(def.items.type)) {
                return `(${def.items.type.join(',')})[]`;
              } else {
                return `${def.items.type}[]`;
              }
            })
            .join(' | ')}{' '}
          {/* TODO
        {required?.includes(name) && (
          <InfoLabel>{t('schema.required')}</InfoLabel>
        )}{' '}
        */}
        </div>
      )}
      {description && <div className="description">{description}</div>}

      <dl>
        <Constraints type="generic" def={def} />
        {types.map(type => (
          <>
            <Constraints type={type} def={def} />
          </>
        ))}
        <Constraints def={def} />
      </dl>
      {/*
      <ul>
        {Object.entries(properties).map(([name, def]) => (
          <ObjectProperty name={name} def={def} required={required} />
        ))}
      </ul>
      */}
      {/*additionalProperties && <>
        <h4>{t('schema.additional-properties')}</h4>
        <ul>
          {Object.entries(additionalProperties).map(([name, def]) => (
            <ObjectProperty name={name} def={def} required={required} />
          ))}
        </ul>
      </>*/}
    </section>
  );
}
