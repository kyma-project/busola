import React from 'react';
import { Label as UI5Label } from '@ui5/webcomponents-react';
import './Label.scss';

export function Label({ required, forElement, children, showColon = true }) {
  return (
    <>
      <UI5Label required={required} for={forElement} showColon={showColon}>
        {children}
      </UI5Label>
    </>
  );
}
