import { MessagePage } from 'fundamental-react';

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
    <MessagePage
      image={
        <svg role="img" className="fd-message-page__icon">
          <use xlinkHref="#sapIllus-Scene-NoData" />
        </svg>
      }
      title={tExt(structure?.title)}
      subtitle={tExt(structure?.subtitle)}
      actions={structure.children.map((def, idx) => (
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
