import React, { useEffect } from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { Button, FormFieldset } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { newServer, validateSpec } from './helpers';
import { PortsForm } from './PortsForm';
import { TlsForm } from './TlsForm';
import { HostsForm } from './HostsForm';

export function SingleServerForm({
  server,
  index,
  setServers,
  servers,
  isAdvanced,
}) {
  const { t } = useTranslation();

  function deleteServer(server) {
    setServers(servers.filter(oldServer => oldServer.id !== server.id));
  }

  const deleteButton = (
    <Button
      compact
      glyph="delete"
      onClick={() => deleteServer(server)}
      option="transparent"
      type="negative"
    >
      {t('gateways.create-modal.advanced.delete-server')}
    </Button>
  );
  return (
    <FormFieldset className="servers-form">
      {isAdvanced && (
        <CreateForm.CollapsibleSection
          title={`${t('gateways.create-modal.simple.server')} ${index + 1}`}
          actions={deleteButton}
          defaultOpen
        >
          <PortsForm
            server={server}
            servers={servers}
            setServers={setServers}
            disabled={true}
          />
          <TlsForm
            server={server}
            servers={servers}
            setServers={setServers}
            disabled={true}
          />
          <HostsForm
            server={server}
            servers={servers}
            setServers={setServers}
            disabled={true}
          />
        </CreateForm.CollapsibleSection>
      )}

      {!isAdvanced && (
        <div className="servers-form">
          <PortsForm
            server={server}
            servers={servers}
            setServers={setServers}
          />
          <TlsForm server={server} servers={servers} setServers={setServers} />
          <HostsForm
            server={server}
            servers={servers}
            setServers={setServers}
          />
        </div>
      )}
    </FormFieldset>
  );
}

export function ServersForm({ gateway, setGateway, isAdvanced, setValid }) {
  const { t } = useTranslation();

  useEffect(() => {
    setValid(validateSpec(gateway));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway.servers]);

  function addServer() {
    setGateway({ ...gateway, servers: [...gateway.servers, newServer()] });
    setValid(false); //todo wywal
  }

  const serversActions = (
    <Button compact glyph="add" onClick={addServer} option="transparent">
      {t('gateways.create-modal.advanced.add-server')}
    </Button>
  );

  return (
    <CreateForm.CollapsibleSection
      title={t('gateways.create-modal.simple.servers')}
      actions={isAdvanced ? serversActions : null}
      defaultOpen
    >
      {gateway.servers.map((server, index) => (
        <SingleServerForm
          key={server.id}
          index={index}
          server={server}
          servers={gateway.servers}
          setServers={servers => setGateway({ ...gateway, servers })}
          isAdvanced={isAdvanced}
        />
      ))}
    </CreateForm.CollapsibleSection>
  );
}
