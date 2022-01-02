import React from 'react';

import { ObjectProperty } from './ObjectProperty';

export function JSONSchema({
  description,
  properties,
  patternProperties,
  additionalProperties,
  required,
  propertyNames,
}) {
  return (
    <section className="object-details">
      {description && <div className="object-description">{description}</div>}
      <ul>
        {Object.entries(properties).map(([name, def]) => (
          <ObjectProperty name={name} def={def} required={required} />
        ))}
      </ul>
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
