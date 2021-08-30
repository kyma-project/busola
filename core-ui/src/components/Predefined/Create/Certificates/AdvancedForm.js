import React from 'react';

import { SimpleForm } from './SimpleForm';

export function AdvancedForm({ certificate, setCertificate }) {
  return (
    <SimpleForm certificate={certificate} setCertificate={setCertificate} />
  );
}
