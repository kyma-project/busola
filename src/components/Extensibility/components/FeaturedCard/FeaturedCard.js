import { Widget, InlineWidget } from '../Widget';
import { FeatureCardBanner } from 'shared/components/FeatureCard/FeatureCard';

import './FeaturedCard.scss';

export function FeaturedCard({ value, structure, schema, ...props }) {
  const { id, title, description, illustration, design } = structure;

  return (
    <FeatureCardBanner
      id={id}
      title={title}
      description={description}
      image={illustration}
      design={design}
      buttons={structure.children?.slice(0, 2).map((def, idx) => (
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
    />
  );
}
