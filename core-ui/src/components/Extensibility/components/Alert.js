import React from 'react';

import { MessageStrip } from 'fundamental-react';
import { useGetTranslation } from 'components/Extensibility/helpers';
import classNames from 'classnames';

export const Alert = ({ value, schema, structure }) => {
  const { t: tExt } = useGetTranslation();
  const alert = structure.alert || value;
  const schemaType = structure.type || 'information';

  const messageClassNames = classNames({
    'fd-margin--md': !structure.disableMargin,
  });

  return (
    <div className={messageClassNames}>
      <MessageStrip type={schemaType}>{tExt(alert)}</MessageStrip>
    </div>
  );
};
