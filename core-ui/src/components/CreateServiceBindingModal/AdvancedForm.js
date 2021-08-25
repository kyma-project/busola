import React from 'react';
import { FormFieldset, FormInput, FormLabel } from 'fundamental-react';
import { Tooltip } from 'react-shared';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import './ServiceBindingAdvancedForm.scss';
import { SimpleForm } from './SimpleForm';
import { K8sResourceSelect } from '../../shared/components/K8sResourceSelect';
import { useTranslation } from 'react-i18next';
import { JSONSection } from './JSONInputSection';

export function AdvancedForm({
  serviceBinding,
  setServiceBinding,
  namespaceId,
}) {
  const { t } = useTranslation();

  return (
    <>
      <SimpleForm
        serviceBinding={serviceBinding}
        setServiceBinding={setServiceBinding}
        namespaceId={namespaceId}
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
              <Tooltip
                content={t('btp-service-bindings.create.secret-description')}
              >
                <FormLabel>{t('btp-service-bindings.secret')}</FormLabel>
              </Tooltip>
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
      <JSONSection
        title={t('btp-service-bindings.parameters')}
        value={serviceBinding.parameters}
        setValue={parameters =>
          setServiceBinding({ ...serviceBinding, parameters })
        }
        validate={parsed => !!parsed && typeof parsed === 'object'}
      />
      <JSONSection
        title={t('btp-service-bindings.parameters-from')}
        value={serviceBinding.parametersFrom}
        setValue={parametersFrom =>
          setServiceBinding({ ...serviceBinding, parametersFrom })
        }
        validate={Array.isArray}
      />
    </>
  );
}
