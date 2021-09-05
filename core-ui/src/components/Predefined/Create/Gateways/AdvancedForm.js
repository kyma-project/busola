import React from 'react';
import { SimpleForm } from './SimpleForm';
import './AdvancedForm.scss';

export function AdvancedForm({
  gateway,
  setGateway,
  servers,
  setServers,
  setValid,
}) {
  return (
    <>
      <SimpleForm
        gateway={gateway}
        setGateway={setGateway}
        servers={servers}
        setServers={setServers}
        isAdvanced={true}
        setValid={setValid}
      />
    </>
  );
}
