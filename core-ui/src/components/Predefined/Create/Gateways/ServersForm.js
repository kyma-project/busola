import React, { useEffect, useState } from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { Button, FormFieldset } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { newServer, validateSpec } from './helpers';
import { PortsForm } from './PortsForm';
import { TlsForm } from './TlsForm';
import { HostsForm } from './HostsForm';
import shortid from 'shortid';

export function SingleServerForm({ index, server, setServers, isAdvanced }) {
  const { t } = useTranslation();

  function deleteServer(server) {
    setServers(servers =>
      servers.filter(oldServer => oldServer.id !== server.id),
    );
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
          title={`${t('gateways.create-modal.simple.server')} ${index}`}
          actions={deleteButton}
          defaultOpen
        >
          <PortsForm
            index={index}
            server={server}
            setServers={setServers}
            disabled={true}
          />
          <TlsForm
            index={index}
            server={server}
            setServers={setServers}
            disabled={true}
          />
          <HostsForm
            index={index}
            server={server}
            setServers={setServers}
            disabled={true}
          />
        </CreateForm.CollapsibleSection>
      )}

      {!isAdvanced && (
        <div className="servers-form">
          <PortsForm index={index} server={server} setServers={setServers} />
          <TlsForm index={index} server={server} setServers={setServers} />
          <HostsForm index={index} server={server} setServers={setServers} />
        </div>
      )}
    </FormFieldset>
  );
}

export function ServersForm({ gateway, setGateway, isAdvanced, setValid }) {
  const { t } = useTranslation();
  const [servers, setServers] = useState(
    (gateway.servers || []).map(server => ({
      ...server,
      id: shortid.generate(),
    })),
  );
  useEffect(() => {
    setGateway({
      ...gateway,
      servers: servers,
    });

    setValid(validateSpec(gateway));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servers]);

  function addServer() {
    setServers(servers => [...servers, newServer()]);
    setValid(false);
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
      {servers.map((server, index) => {
        console.log('server', server);

        return (
          <SingleServerForm
            key={server.id}
            index={index}
            server={server}
            setServers={setServers}
            isAdvanced={isAdvanced}
          />
        );
      })}
    </CreateForm.CollapsibleSection>
  );
}
