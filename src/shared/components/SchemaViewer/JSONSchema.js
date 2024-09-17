import { useTranslation } from 'react-i18next';

import { ObjectProperties } from './ObjectProperties';
import { FlexBox, ObjectStatus, Text } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';

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
            <Text style={spacing.sapUiTinyMarginEnd} className="property-name">
              {name}
            </Text>
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
            <ObjectStatus inverted state="Warning">
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
