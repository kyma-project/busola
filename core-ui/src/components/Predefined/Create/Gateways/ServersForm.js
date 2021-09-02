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
      <CreateForm.CollapsibleSection
        title={t('gateways.create-modal.advanced.port.ports')}
        defaultOpen={!isAdvanced}
      >
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
              onChange={e =>
                setServers({ port: { name: e.target.value || '' } })
              }
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
      </CreateForm.CollapsibleSection>

      <CreateForm.CollapsibleSection
        title={t('gateways.create-modal.advanced.tls.tls')}
        defaultOpen={!isAdvanced}
      >
        <CreateForm.FormField
          label={
            <FormLabel required>
              {t('gateways.create-modal.advanced.tls.mode')}
            </FormLabel>
          }
          input={
            <FormInput
              type="text"
              required
              compact
              placeholder={t(
                'gateways.create-modal.advanced.placeholders.tls.mode',
              )}
              value={server.tls.mode}
              onChange={e =>
                setServers({ tls: { mode: e.target.value || '' } })
              }
            />
          }
        />
        <CreateForm.FormField
          label={
            <FormLabel required>
              {t('gateways.create-modal.advanced.tls.credentialName')}
            </FormLabel>
          }
          input={
            <FormInput
              type="text"
              required
              compact
              placeholder={t(
                'gateways.create-modal.advanced.placeholders.tls.credentialName',
              )}
              value={server.tls.credentialName}
              onChange={e =>
                setServers({ tls: { credentialName: e.target.value || '' } })
              }
            />
          }
        />
      </CreateForm.CollapsibleSection>
      <CreateForm.CollapsibleSection
        title={t('gateways.create-modal.advanced.hosts')}
        defaultOpen={!isAdvanced}
      >
        <CreateForm.FormField
          label={
            <FormLabel required>
              {t('gateways.create-modal.advanced.hosts')}
            </FormLabel>
          }
          input={
            <FormInput
              type="text"
              required
              compact
              placeholder={t(
                'gateways.create-modal.advanced.placeholders.hosts',
              )}
              value={server.hosts}
              onChange={e => setServers({ hosts: e.target.value || '' })}
            />
          }
        />
      </CreateForm.CollapsibleSection>
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
    </CreateForm.CollapsibleSection>
  );
}
