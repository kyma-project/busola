import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextArrayInput } from 'shared/ResourceForm/fields';

export const HostsForm = ({ server = {}, servers, setServers }) => {
  const { t } = useTranslation();

  const setValue = hosts => {
    server.hosts = hosts;
    setServers([...servers]);
  };

  return (
    <TextArrayInput
      advanced
      required
      ariaLabel={t('gateways.aria-labels.host')}
      tooltipContent={t('gateways.create-modal.tooltips.hosts')}
      value={server.hosts || []}
      setValue={setValue}
      title={t('gateways.create-modal.advanced.hosts')}
      inputProps={{
        placeholder: t('gateways.create-modal.advanced.placeholders.hosts'),
      }}
      defaultOpen
    />
  );
};
