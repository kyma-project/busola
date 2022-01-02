import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoLabel, Icon } from 'fundamental-react';

import { Constraints } from './Constraints';
import { JSONSchema } from './ObjectField';

export function ObjectProperty({
  name,
  def: { type, description, ...def },
  required,
}) {
  const { t } = useTranslation();

  const [objectCollapsed, setObjectCollapsed] = useState(true);
  const [arrayCollapsed, setArrayCollapsed] = useState(true);
  const types = Array.isArray(type) ? type : [type];

  return (
    <li key={name}>
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
        {required?.includes(name) && (
          <InfoLabel>{t('schema.required')}</InfoLabel>
        )}{' '}
      </div>
      {description && <div style={{ color: '#666' }}>{description}</div>}
      <Constraints for="generic" def={def} />
      <Constraints for="number" def={def} />
      <Constraints for="string" def={def} />
      <Constraints def={def} />
      {types.includes('array') && (
        <>
          <header
            className="expander"
            onClick={() => setArrayCollapsed(!arrayCollapsed)}
          >
            <Icon
              className="control-icon"
              ariaHidden
              glyph={
                arrayCollapsed
                  ? 'navigation-right-arrow'
                  : 'navigation-down-arrow'
              }
            />{' '}
            {t('schema.array-items')}
          </header>
          {!arrayCollapsed && (
            <section className="object-details">
              <Constraints for="array" def={def} />
              <ul>
                <ObjectProperty
                  name={t('schema.array-item', { name })}
                  def={def.items}
                />
              </ul>
            </section>
          )}
        </>
      )}
      {types.includes('object') && def.properties && (
        <>
          <header
            className="expander"
            onClick={() => setObjectCollapsed(!objectCollapsed)}
          >
            <Icon
              className="control-icon"
              ariaHidden
              glyph={
                objectCollapsed
                  ? 'navigation-right-arrow'
                  : 'navigation-down-arrow'
              }
            />{' '}
            {t('schema.object-properties')}
          </header>
          {!objectCollapsed && (
            <>
              <Constraints for="array" def={def} />
              <JSONSchema {...def} />
            </>
          )}
        </>
      )}
    </li>
  );
}
