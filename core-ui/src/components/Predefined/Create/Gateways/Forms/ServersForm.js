import React from 'react';
import { FormFieldset } from 'fundamental-react';
import { PortsForm } from './PortsForm';
import { TlsForm } from './TlsForm';
import { HostsForm } from './HostsForm';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

export function SingleServerForm(props) {
  return (
    <FormFieldset>
      <PortsForm {...props} />
      <TlsForm {...props} />
      <HostsForm {...props} />
    </FormFieldset>
  );
}

export function SingleServerInput({ value: servers, setValue: setServers }) {
  return (
    <ResourceForm.CollapsibleSection
      title="Server"
      defaultOpen
      canChangeState={false}
    >
      <SingleServerForm
        server={servers?.[0]}
        servers={servers}
        setServers={setServers}
      />
    </ResourceForm.CollapsibleSection>
  );
}
