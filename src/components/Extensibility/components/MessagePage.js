import { IllustratedMessage } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-fiori/dist/illustrations/NoData';

import { Widget, InlineWidget } from './Widget';
import { useGetTranslation } from '../helpers';

export function MessagePanel({
  value,
  structure,
  schema,
  disableMargin = false,
  ...props
}) {
  const { t: tExt } = useGetTranslation();

  return (
    <IllustratedMessage
      name="NoData"
      size="Scene"
      titleText={tExt(structure?.title)}
      subtitleText={tExt(structure?.subtitle)}
    >
      {structure.children.map((def, idx) => (
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
    </IllustratedMessage>
  );
}
