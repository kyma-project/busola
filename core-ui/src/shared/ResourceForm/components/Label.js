import React from 'react';
import { FormLabel } from 'fundamental-react';
import './Label.scss';

export function Label({ required, children }) {
  return (
    <>
      <FormLabel required={required} includeColon>
        {children}
      </FormLabel>
    </>
  );
}
