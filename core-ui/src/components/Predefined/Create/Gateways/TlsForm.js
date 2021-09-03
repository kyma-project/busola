import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { Checkbox, Select, FormLabel, FormInput } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { TSL_MODE } from './helpers';

export const TlsForm = ({ disabled = false, index, server, setServers }) => {
  const { t } = useTranslation();

  const setTlsValue = (server, variableName, value) => {
    let newValue = server;
    if (value === null) {
      delete newValue.port[variableName];
    } else {
      newValue = {
        ...newValue,
        tls: {
          [variableName]: value,
        },
      };
      // .tls[variableName] = value;
    }

    setServers(servers => [
      ...servers.slice(0, index),
      newValue,
      ...servers.slice(index + 1, servers.length),
    ]);
  };
  const setValue = (server, variableName, value) => {
    let newValue = server;
    if (value === null) {
      delete newValue.port[variableName];
    } else {
      newValue = {
        ...newValue,
        [variableName]: value,
      };
    }

    setServers(servers => [
      ...servers.slice(0, index),
      newValue,
      ...servers.slice(index + 1, servers.length),
    ]);
  };

  const resourceOptions = TSL_MODE.map(mode => ({
    key: mode,
    text: mode,
  }));
  return (
    <CreateForm.CollapsibleSection
      title={t('gateways.create-modal.advanced.tls.tls')}
      defaultOpen
      disabled={disabled}
      actions={
        <Checkbox
          compact
          checked={server.isTls}
          onChange={(e, checked) => setValue(server, 'isTls', checked)}
          dir="rtl"
        >
          {t('gateways.create-modal.advanced.enable-tls')}
        </Checkbox>
      }
    >
      <CreateForm.FormField
        label={
          <FormLabel>{t('gateways.create-modal.advanced.tls.mode')}</FormLabel>
        }
        input={
          <Select
            compact
            onSelect={(_, selected) => {
              setTlsValue(server, 'mode', selected.key);
            }}
            selectedKey={server.tls?.mode || ''}
            options={resourceOptions}
            disabled={!server.isTls}
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.tls.mode',
            )}
          ></Select>
        }
      />
      <CreateForm.FormField
        label={
          <FormLabel>
            {t('gateways.create-modal.advanced.tls.credentialName')}
          </FormLabel>
        }
        input={
          <FormInput
            type="text"
            disabled={!server.isTls}
            compact
            placeholder={t(
              'gateways.create-modal.advanced.placeholders.tls.credentialName',
            )}
            value={server.tls?.credentialName || ''}
            onChange={e =>
              setTlsValue(server, 'credentialName', e.target.value || '')
            }
          />
        }
      />
    </CreateForm.CollapsibleSection>
  );
};
