import React from 'react';

import { MessageStrip } from 'fundamental-react';
import { useGetTranslation } from 'components/Extensibility/helpers';
import classNames from 'classnames';

export const Message = ({ value, schema, structure }) => {
  const { t: tExt } = useGetTranslation();
  const message = structure.message || value;
  const schemaType = structure.type || 'information';

  const messageClassNames = classNames({
    'fd-margin--md': !structure.disableMargin,
  });

  return (
    <div className={messageClassNames}>
      <MessageStrip type={schemaType}>{tExt(message)}</MessageStrip>
    </div>
  );
};
