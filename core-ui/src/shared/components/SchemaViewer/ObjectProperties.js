import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Icon } from 'fundamental-react';

import { Generic, PROPERTIES } from './handlers';

function ObjectProperty({
  propKey,
  label,
  val,
  handler,
  required,
  expanded = false,
}) {
  const [collapsed, setCollapsed] = useState(!expanded);
  const Handler = handler;

  return (
    <>
      <dd
        onClick={() => setCollapsed(!collapsed)}
        className={classNames({
          expandable: handler.expandable,
        })}
      >
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
            'full-width': handler.fullWidth || handler.expandable,
          })}
        >
          <Handler val={val} required={required} />
        </dt>
      )}
    </>
  );
}

export function ObjectProperties({ def, expanded = false }) {
  const { t } = useTranslation();

  return (
    <>
      {Object.entries(PROPERTIES)
        .filter(([key, handler]) => !!handler)
        .filter(([key]) => Object.keys(def).includes(key))
        .map(([key, handler]) => (
          <ObjectProperty
            key={key}
            propKey={key}
            label={t(`schema.fields.${key}`)}
            handler={handler}
            val={def[key]}
            required={key === 'properties' ? def.required : []}
            expanded={expanded}
          />
        ))}
      {Object.keys(def)
        .filter(key => !Object.keys(PROPERTIES).includes(key))
        .map(key => (
          <ObjectProperty
            key={key}
            propKey={key}
            label={key}
            handler={Generic}
            val={def[key]}
            expanded={expanded}
          />
        ))}
    </>
  );
}
