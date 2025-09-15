import { useGetTranslation } from '../helpers';

import { Widget, InlineWidget } from './Widget';
import { TabContainer, Tab } from '@ui5/webcomponents-react';

export function Tabs({
  value,
  structure,
  schema,
  disableMargin = false,
  ...props
}) {
  const { widgetT } = useGetTranslation();

  return Array.isArray(structure?.children) ? (
    <div className="sap-margin-top-small sap-margin-x-small">
      <TabContainer tabLayout="Inline" contentBackgroundDesign="Transparent">
        {structure.children.map((child, idx) => (
          <Tab key={`tab-wrapper-${idx}`} text={widgetT(child)}>
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
          </Tab>
        ))}
      </TabContainer>
    </div>
  ) : (
    <></>
  );
}
