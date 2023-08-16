import React from 'react';

import { InfoLabel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ObjectProperties } from './ObjectProperties';
import { ObjectStatus } from '@ui5/webcomponents-react';

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
            <ObjectStatus inverted state="Error">
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
