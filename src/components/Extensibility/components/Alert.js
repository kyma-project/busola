import React from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useGetTranslation } from 'components/Extensibility/helpers';
import classNames from 'classnames';

export const Alert = ({ value, schema, structure, ...props }) => {
  const { t: tExt } = useGetTranslation();

  let schemaType = 'Information';
  if (structure.severity === 'warning') {
    schemaType = 'Warning';
  } else if (structure.severity === 'error') {
    schemaType = 'Negative';
  } else if (structure.severity === 'success') {
    schemaType = 'Positive';
  }

  const messageClassNames = classNames({
    'bsl-margin--md': !structure.disableMargin,
  });

  return (
    <div className={messageClassNames}>
      <MessageStrip design={schemaType} hideCloseButton>
        {tExt(value)}
      </MessageStrip>
    </div>
  );
};
