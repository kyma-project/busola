import React from 'react';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { LabelsInput } from 'components/Lambdas/components';
import { FormFieldset, FormLabel } from 'fundamental-react';
import { K8sNameInput } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { GatewaySelectorInput } from './GatewaySelectorInput/GatewaySelectorInput';
import { ServersForm } from './ServersForm';
import { validateSpec } from './helpers';
import shortid from 'shortid';

export function SimpleForm({
  gateway,
  setGateway,
  isAdvanced = false,
  setValid,
}) {
  gateway.servers.forEach(server => {
    if (!server.id) {
      server.id = shortid.generate();
    }
  });

  const { t, i18n } = useTranslation();

  return (
    <>
      <CreateForm.Section>
        <FormFieldset>
          <CreateForm.FormField
            label={<FormLabel required>{t('common.labels.name')}</FormLabel>}
            input={
              <K8sNameInput
                showLabel={false}
                compact
                kind="Gateway"
                onChange={e => setGateway({ ...gateway, name: e.target.value })}
                value={gateway.name}
                i18n={i18n}
              />
            }
          />
          <CreateForm.FormField
            label={<FormLabel>{t('common.headers.labels')}</FormLabel>}
            input={
              <LabelsInput
                showFormLabel={false}
                labels={gateway.labels}
                onChange={labels => setGateway({ ...gateway, labels })}
                i18n={i18n}
                compact
              />
            }
          />
          <CreateForm.FormField
            label={
              <FormLabel required>
                {t('gateways.create-modal.simple.selector')}
              </FormLabel>
            }
            input={
              <GatewaySelectorInput
                showFormLabel={false}
                required
                labels={gateway.selector}
                type={t('gateways.create-modal.simple.selector')}
                onChange={selector => {
                  setGateway({ ...gateway, selector });
                  setValid(validateSpec({ ...gateway, selector }));
                }}
                i18n={i18n}
                compact
              />
            }
          />
        </FormFieldset>
      </CreateForm.Section>
      <ServersForm
        gateway={gateway}
        setGateway={setGateway}
        setValid={setValid}
        isAdvanced={isAdvanced}
      />
    </>
  );
}
