import React from 'react';
import { FormFieldset } from 'fundamental-react';
import { PortsForm } from './PortsForm';
import { TlsForm } from './TlsForm';
import { HostsForm } from './HostsForm';
import { ResourceForm } from 'shared/ResourceForm';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <ResourceForm.CollapsibleSection
      title={t('gateways.create-modal.simple.server')}
      defaultOpen
    >
      <SingleServerForm
        server={servers?.[0]}
        servers={servers}
        setServers={setServers}
      />
    </ResourceForm.CollapsibleSection>
  );
}
