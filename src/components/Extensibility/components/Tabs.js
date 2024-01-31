import { Widget, InlineWidget } from './Widget';
import { useGetTranslation } from '../helpers';
import { TabContainer, Tab } from '@ui5/webcomponents-react';

export function Tabs({
  value,
  structure,
  schema,
  disableMargin = false,
  extraContent,
  ...props
}) {
  const { widgetT } = useGetTranslation();

  return (
    <>
      {Array.isArray(structure?.children) && (
        <TabContainer tabLayout="Inline" contentBackgroundDesign="Transparent">
          {structure.children.map((child, idx) => (
            <Tab key={`tab-wrapper-${idx}`} text={widgetT(child)}>
              {extraContent}
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
      )}
    </>
  );
}
