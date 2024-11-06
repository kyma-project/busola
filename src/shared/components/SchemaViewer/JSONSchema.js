import { useTranslation } from 'react-i18next';

import { ObjectProperties } from './ObjectProperties';
import { FlexBox, ObjectStatus, Text } from '@ui5/webcomponents-react';

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
        <FlexBox alignItems="Center">
          {name && (
            <Text className="property-name sap-margin-end-tiny">{name}</Text>
          )}
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
              .map(type => (
                <ObjectStatus inverted>{type.toUpperCase()}</ObjectStatus>
              ))}{' '}
          {isRequired && (
            <ObjectStatus inverted state="Critical">
              {t('schema.required')}
            </ObjectStatus>
          )}
        </FlexBox>
      )}
      {description && <div className="description">{description}</div>}
      <dl>
        <ObjectProperties def={def} expanded={root} />
      </dl>
    </section>
  );
}
