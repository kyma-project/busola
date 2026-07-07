import { Title } from '@ui5/webcomponents-react';

import { useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';
import './Section.scss';

interface SectionProps {
  value: any;
  structure: any;
  schema: any;
  singleRootResource: any;
  embedResource: any;
  [key: string]: any;
}

export function Section({
  value,
  structure,
  schema,
  singleRootResource,
  embedResource,
  ...props
}: SectionProps) {
  const { widgetT } = useGetTranslation();
  const sectionId = `section-heading-${structure.name?.replace(/\s+/g, '-')}`;

  return (
    <section aria-labelledby={sectionId} data-testid="extensibility-section">
      <Title
        level="H3"
        size="H4"
        className="sap-margin-top-small sap-margin-bottom-small"
        id={sectionId}
      >
        {widgetT(structure)}
      </Title>
      <div className="extensibility-section__content">
        {(structure.children || []).map((def: any, idx: number) => (
          <Widget
            key={idx}
            value={value}
            structure={def}
            schema={schema}
            inlineRenderer={InlineWidget}
            inlineContext={false}
            singleRootResource={singleRootResource}
            embedResource={embedResource}
            {...props}
          />
        ))}
      </div>
    </section>
  );
}
