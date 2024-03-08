import { Label as UI5Label } from '@ui5/webcomponents-react';

export function Label({ required, forElement, children, showColon = true }) {
  return (
    <>
      <UI5Label required={required} for={forElement} showColon={showColon}>
        {children}
      </UI5Label>
    </>
  );
}
