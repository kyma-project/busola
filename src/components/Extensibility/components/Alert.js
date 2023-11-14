import React from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useGetTranslation } from 'components/Extensibility/helpers';

import { spacing } from '@ui5/webcomponents-react-base';

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

  return (
    <div style={!structure.disableMargin ? spacing.sapUiMediumMargin : null}>
      <MessageStrip design={schemaType} hideCloseButton>
        {tExt(value)}
      </MessageStrip>
    </div>
  );
};
