import { MessageStrip } from '@ui5/webcomponents-react';
import { useGetTranslation } from 'components/Extensibility/helpers';

export const Alert = ({ value, schema, structure, ...props }) => {
  const { t: tExt } = useGetTranslation();

  let schemaType = 'Information';
  if (structure.severity === 'warning') {
    schemaType = 'Critical';
  } else if (structure.severity === 'error') {
    schemaType = 'Negative';
  } else if (structure.severity === 'success') {
    schemaType = 'Positive';
  }

  return (
    <div className={!structure.disableMargin ? 'sap-margin-medium' : ''}>
      <MessageStrip design={schemaType} hideCloseButton>
        {tExt(value)}
      </MessageStrip>
    </div>
  );
};
