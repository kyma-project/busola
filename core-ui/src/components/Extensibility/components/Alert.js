import React from 'react';

import { MessageStrip } from 'fundamental-react';
import { useGetTranslation } from 'components/Extensibility/helpers';
import classNames from 'classnames';

export const Alert = ({ value, schema, structure, ...props }) => {
  const { t: tExt } = useGetTranslation();

  const schemaType = structure.severity || 'information';

  const messageClassNames = classNames({
    'fd-margin--md': !structure.disableMargin,
  });

  return (
    <div className={messageClassNames}>
      <MessageStrip type={schemaType}>{tExt(value)}</MessageStrip>
    </div>
  );
};
