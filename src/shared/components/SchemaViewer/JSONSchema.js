import React from 'react';

import { InfoLabel, ObjectStatus } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ObjectProperties } from './ObjectProperties';

export function JSONSchema({
  root = false,
  type,
  name,
  description,
  isRequired,
  ...def
}) {
  const { t } = useTranslation();

  const types = type ? (Array.isArray(type) ? type : [type]) : [];
  return (
    <section className="object-details">
      {!root && (
        <div>
          {name && <span className="property-name">{name}</span>}{' '}
          {types &&
            types
              .map(type => {
                if (type !== 'array') {
                  return type;
                } else if (Array.isArray(def.items.type)) {
                  return `(${def.items.type.join(',')})[]`;
                } else {
                  return `${def.items.type}[]`;
                }
              })
              .map(type => <InfoLabel key={type}>{type}</InfoLabel>)}{' '}
          {isRequired && (
            <ObjectStatus inverted status="critical">
              {t('schema.required')}
            </ObjectStatus>
          )}{' '}
        </div>
      )}
      {description && <div className="description">{description}</div>}

      <dl>
        <ObjectProperties def={def} expanded={root} />
      </dl>
    </section>
  );
}
