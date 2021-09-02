import React, { useEffect, useState } from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { Button, FormFieldset, FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { newServer } from './helpers';
import { PortsForm } from './PortsForm';
import { TslForm } from './TslForm';
import { HostsForm } from './HostsForm';
import shortid from 'shortid';

export function SingleServerForm({ index, server, setServers, isAdvanced }) {
  const { t } = useTranslation();

  function deleteServer(server) {
    setServers(servers => {
      console.log(servers, server, server.id);
      return servers.filter(oldServer => oldServer.id !== server.id);
    });
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
    <FormFieldset>
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
          <TslForm
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
        <>
          <PortsForm index={index} server={server} setServers={setServers} />
          <TslForm index={index} server={server} setServers={setServers} />
          <HostsForm index={index} server={server} setServers={setServers} />
        </>
      )}
    </FormFieldset>
  );
}

export function ServersForm({ gateway, setGateway, isAdvanced }) {
  const { t } = useTranslation();
  const [servers, setServers] = useState(
    gateway.servers.map(server => ({ ...server, id: shortid.generate() })),
  );
  useEffect(() => {
    setGateway({
      gateway,
      servers: servers,
    });
  }, [servers]);

  function addServer() {
    // setServers([...servers, newServer()]);
    setServers(servers => [...servers, newServer()]);
    // setValid(false);
  }

  const serversActions = (
    <Button compact glyph="add" onClick={addServer} option="transparent">
      {t('gateways.create-modal.advanced.add-server')}
    </Button>
  );
  console.log('servers', servers);

  return (
    <CreateForm.CollapsibleSection
      title={t('gateways.create-modal.simple.servers')}
      actions={isAdvanced ? serversActions : null}
      defaultOpen
    >
      {servers.map((server, index) => {
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
