import { MessageStrip } from '@ui5/webcomponents-react';
import { useGetTranslation } from 'components/Extensibility/helpers';

interface AlertProps {
  value: any;
  structure: any;
}

export const Alert = ({ value, structure }: AlertProps) => {
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
      <MessageStrip design={schemaType as any} hideCloseButton>
        {tExt(value)}
      </MessageStrip>
    </div>
  );
};
