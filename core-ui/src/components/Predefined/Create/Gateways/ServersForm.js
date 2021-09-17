import React from 'react';
import { FormFieldset } from 'fundamental-react';
import { PortsForm } from './PortsForm';
import { TlsForm } from './TlsForm';
import { HostsForm } from './HostsForm';

export function SingleServerForm({ server, setServers, servers }) {
  return (
    <FormFieldset>
      <PortsForm server={server} servers={servers} setServers={setServers} />
      <TlsForm server={server} servers={servers} setServers={setServers} />
      <HostsForm server={server} servers={servers} setServers={setServers} />
    </FormFieldset>
  );
}
