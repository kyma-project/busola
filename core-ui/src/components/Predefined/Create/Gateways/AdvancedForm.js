import React from 'react';
import { SimpleForm } from './SimpleForm';
import './AdvancedForm.scss';

export function AdvancedForm({ gateway, setGateway }) {
  return (
    <>
      <SimpleForm gateway={gateway} setGateway={setGateway} isAdvanced={true} />
    </>
  );
}
