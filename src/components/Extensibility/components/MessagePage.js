// import { useTranslation } from 'react-i18next';
import { MessagePage } from 'fundamental-react';

import { Widget, InlineWidget } from './Widget';

export function MessagePanel({
  value,
  structure,
  schema,
  disableMargin = false,
  ...props
}) {
  //   const { t } = useTranslation();

  return (
    <MessagePage
      className="empty-list"
      image={
        <svg role="presentation" className="fd-message-page__icon">
          <use xlinkHref="#sapIllus-Scene-NoData" />
        </svg>
      }
      title={"Seems that you don't have any Kyma Modules Configured"}
      subtitle={
        'Add at least one Kyma Module. Add your module under "kyma-system -> Kyma"'
      }
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
