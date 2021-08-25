import React from 'react';
import {
  FormFieldset,
  FormInput,
  FormLabel,
  MessageStrip,
} from 'fundamental-react';
import { ControlledEditor, useTheme } from 'react-shared';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import './ServiceBindingAdvancedForm.scss';
import { SimpleForm } from './SimpleForm';
import { K8sResourceSelect } from '../../shared/components/K8sResourceSelect';
import { useTranslation } from 'react-i18next';

function isParseableToObject(value) {
  try {
    const parsed = JSON.parse(value);
    return !!parsed && typeof parsed === 'object';
  } catch (_) {
    return false;
  }
}

export function AdvancedForm({
  serviceBinding,
  setServiceBinding,
  namespaceId,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [areParamsValid, setParamsValid] = React.useState(true);

  const onEditorChange = (_, value) => {
    if (isParseableToObject(value)) {
      setServiceBinding({
        ...serviceBinding,
        parameters: value,
      });
      setParamsValid(true);
    } else {
      setParamsValid(false);
    }
  };

  return (
    <>
      <SimpleForm
        serviceBinding={serviceBinding}
        setServiceBinding={setServiceBinding}
      />
      <CreateModal.Section>
        <FormFieldset>
          <CreateModal.FormField
            label={
              <FormLabel>{t('btp-service-bindings.external-name')}</FormLabel>
            }
            input={
              <FormInput
                compact
                value={serviceBinding.externalName}
                placeholder={t(
                  'btp-service-bindings.create.external-name-placeholder',
                )}
                onChange={e =>
                  setServiceBinding({
                    ...serviceBinding,
                    externalName: e.target.value,
                  })
                }
              />
            }
          />
          <CreateModal.FormField
            label={
              <FormLabel>{t('btp-service-bindings.external-name')}</FormLabel>
            }
            input={
              <K8sResourceSelect
                value={serviceBinding.secretName}
                compact
                resourceType={t('btp-service-bindings.secret')}
                onSelect={secretName =>
                  setServiceBinding({ ...serviceBinding, secretName })
                }
                url={`/api/v1/namespaces/${namespaceId}/secrets`}
              />
            }
          />
        </FormFieldset>
      </CreateModal.Section>
      <CreateModal.CollapsibleSection
        title={t('btp-service-bindings.create.instance-parameters')}
        actions={
          !areParamsValid && (
            <MessageStrip type="warning">
              {t('common.messages.parse-error')}
            </MessageStrip>
          )
        }
      >
        <ControlledEditor
          height="12em"
          language="json"
          theme={theme}
          value={serviceBinding.parameters}
          onChange={onEditorChange}
        />
      </CreateModal.CollapsibleSection>
    </>
  );
}
