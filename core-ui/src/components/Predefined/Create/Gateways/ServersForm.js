import React, { useState } from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { Button, FormFieldset, FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { newServer } from './helpers';
import shortid from 'shortid';

export function SingleServerForm({ server, setServers, isAdvanced }) {
  const { t } = useTranslation();

  return (
    <FormFieldset>
      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.port.number')}
          </FormLabel>
        }
        input={
          <FormInput
            type="number"
            required
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.port.number',
            )}
            value={server.port.number}
            onChange={e =>
              setServers({ port: { number: e.target.valueAsNumber || '' } })
            }
          />
        }
      />

      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.port.name')}
          </FormLabel>
        }
        input={
          <FormInput
            type="text"
            required
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.port.name',
            )}
            value={server.port.name}
            onChange={e => setServers({ port: { name: e.target.value || '' } })}
          />
        }
      />
      <CreateForm.FormField
        label={
          <FormLabel required>
            {t('gateways.create-modal.advanced.port.protocol')}
          </FormLabel>
        }
        input={
          <FormInput
            type="text"
            required
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.port.protocol',
            )}
            value={server.port.protocol}
            onChange={e =>
              setServers({ port: { protocol: e.target.value || '' } })
            }
          />
        }
      />
    </FormFieldset>
  );
}

export function ServersForm({ gateway, setGateway, isAdvanced }) {
  const { t } = useTranslation();
  const [servers, setServers] = useState(
    gateway.servers.map(server => ({ ...server, id: shortid.generate() })),
  );
  // function onDeleteServer(server) {
  //   let newServers = servers.filter(
  //     oldServer => oldServer.id !== server.id,
  //   );
  //     setRules(rules => [...rules.slice(0, index), ...rules.slice(index + 1)]);

  // }

  function addServer() {
    setServers([...servers, newServer()]);
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
      {servers.map(server => {
        return (
          <SingleServerForm
            server={server}
            setGateway={setGateway}
            isAdvanced={isAdvanced}
          />
        );
      })}

      {/* {servers.map((server) => (<SingleServerForm server={server} setGateway={setGateway} isAdvanced={isAdvanced} />))} */}
    </CreateForm.CollapsibleSection>
  );
}
