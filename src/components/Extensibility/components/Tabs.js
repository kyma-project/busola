import React from 'react';

import { Tabs as BusolaTabs } from '../../../shared/components/Tabs/Tabs';
import { Widget, InlineWidget } from './Widget';
import { useGetTranslation } from '../helpers';

import './Tabs.scss';

export function Tabs({
  value,
  structure,
  schema,
  disableMargin = false,
  ...props
}) {
  const { widgetT } = useGetTranslation();

  return (
    <>
      {Array.isArray(structure?.children) && (
        <BusolaTabs className="tabs">
          {structure.children.map((child, idx) => (
            <div key={`tab-wrapper-${idx}`} title={widgetT(child)}>
              {Array.isArray(child?.children) &&
                child.children.map((def, idx) => (
                  <Widget
                    key={`tab-content-${idx}`}
                    value={value}
                    structure={def}
                    schema={schema}
                    inlineRenderer={InlineWidget}
                    inlineContext={true}
                    {...props}
                  />
                ))}
            </div>
          ))}
        </BusolaTabs>
      )}
    </>
  );
}
