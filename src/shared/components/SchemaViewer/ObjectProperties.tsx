import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Text, Icon } from '@ui5/webcomponents-react';

import { Generic, PROPERTIES } from './handlers';

type ObjectPropertyProps = {
  label: string;
  val: any;
  handler: any;
  required?: string[];
  expanded?: boolean;
};
function ObjectProperty({
  label,
  val,
  handler,
  required,
  expanded = false,
}: ObjectPropertyProps) {
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
            className="sap-margin-end-tiny"
            aria-hidden
            name={
              collapsed ? 'navigation-right-arrow' : 'navigation-down-arrow'
            }
          />
        )}
        <Text>{label}</Text>
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

type ObjectPropertiesProps = {
  def: any;
  expanded?: boolean;
};
export function ObjectProperties({
  def,
  expanded = false,
}: ObjectPropertiesProps) {
  const { t } = useTranslation();

  return (
    <>
      {Object.entries(PROPERTIES)
        .filter((handler) => !!handler)
        .filter(([key]) => Object.keys(def).includes(key))
        .map(([key, handler]) => (
          <ObjectProperty
            key={key}
            label={t(`schema.fields.${key}`)}
            handler={handler}
            val={def[key]}
            required={key === 'properties' ? def.required : []}
            expanded={expanded}
          />
        ))}
      {Object.keys(def)
        .filter((key) => !Object.keys(PROPERTIES).includes(key))
        .map((key) => (
          <ObjectProperty
            key={key}
            label={key}
            handler={Generic}
            val={def[key]}
            expanded={expanded}
          />
        ))}
    </>
  );
}
