import React from 'react';
import { FormFieldset } from 'fundamental-react';
import { PortsForm } from './PortsForm';
import { TlsForm } from './TlsForm';
import { HostsForm } from './HostsForm';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

export function SingleServerForm({
  server = { port: {} },
  setServers,
  servers = [],
}) {
  return (
    <FormFieldset>
      <PortsForm server={server} servers={servers} setServers={setServers} />
      <TlsForm server={server} servers={servers} setServers={setServers} />
      <HostsForm server={server} servers={servers} setServers={setServers} />
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
