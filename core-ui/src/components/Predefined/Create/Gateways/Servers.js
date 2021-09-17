import { Button, MessageStrip } from 'fundamental-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from '../../../../shared/ResourceForm/ResourceForm';
import { newServer } from './templates';

export function ServerForm({ server, servers, setServers }) {
  return 'siema server';
}

export function Servers({ value: servers, setValue: setServers }) {
  const { t } = useTranslation();

  servers = servers || [];

  const deleteServer = index =>
    setServers(servers.filter((_, i) => index !== i));

  if (!servers.length) {
    return (
      <MessageStrip type="warning">
        {t('deployments.create-modal.advanced.one-container-required')}
      </MessageStrip>
    );
  }

  const content =
    servers.length === 1 ? (
      <ServerForm
        server={servers[0]}
        servers={servers}
        setServers={setServers}
      />
    ) : (
      servers.map((server, i) => (
        <ResourceForm.CollapsibleSection
          key={i}
          // title={t('deployments.create-modal.advanced.container-header', {
          //   name: container?.name || i + 1,
          // })}
          title={'todo'}
          actions={
            <Button
              glyph="delete"
              type="negative"
              compact
              onClick={() => deleteServer(i)}
            />
          }
        >
          <ServerForm
            server={server}
            servers={servers}
            setServers={setServers}
          />
        </ResourceForm.CollapsibleSection>
      ))
    );

  return (
    <ResourceForm.CollapsibleSection
      title="Containers"
      actions={
        <Button
          glyph="add"
          compact
          onClick={() => setServers([...servers, newServer()])}
        >
          Add Container
        </Button>
      }
    >
      {content}
    </ResourceForm.CollapsibleSection>
  );
}
