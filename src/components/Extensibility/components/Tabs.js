import React from 'react';

import { Tabs as BusolaTabs } from '../../../shared/components/Tabs/Tabs';
import { Tab as BusolaTab } from '../../../shared/components/Tabs/Tab';
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
            <BusolaTab key={idx} title={widgetT(child)}>
              {Array.isArray(child?.children) &&
                child.children.map((def, idx) => (
                  <Widget
                    key={idx}
                    value={value}
                    structure={def}
                    schema={schema}
                    inlineRenderer={InlineWidget}
                    inlineContext={true}
                    {...props}
                  />
                ))}
            </BusolaTab>
          ))}
        </BusolaTabs>
      )}
    </>
  );
}
