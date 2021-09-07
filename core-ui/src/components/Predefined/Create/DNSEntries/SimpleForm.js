import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormFieldset, FormLabel, FormTextarea } from 'fundamental-react';
import { K8sNameInput } from 'react-shared';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import { LabelsInput } from 'components/Lambdas/components';

export function SimpleForm({ dnsEntry, setDNSEntry }) {
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
                kind="DNSEntry"
                onChange={e =>
                  setDNSEntry({ ...dnsEntry, name: e.target.value })
                }
                value={dnsEntry.name}
                i18n={i18n}
              />
            }
          />
          <CreateForm.FormField
            label={<FormLabel>{t('common.headers.labels')}</FormLabel>}
            input={
              <LabelsInput
                showFormLabel={false}
                labels={dnsEntry.labels}
                onChange={labels => setDNSEntry({ ...dnsEntry, labels })}
                i18n={i18n}
                compact
              />
            }
          />
          <CreateForm.FormField
            label={<FormLabel>{t('common.headers.annotations')}</FormLabel>}
            input={
              <LabelsInput
                showFormLabel={false}
                labels={dnsEntry.annotations}
                onChange={annotations =>
                  setDNSEntry({ ...dnsEntry, annotations })
                }
                i18n={i18n}
                type={t('common.headers.annotations')}
                compact
              />
            }
          />
          <CreateForm.FormField
            label={<FormLabel required>Targets</FormLabel>}
            required
            input={
              <FormTextarea
                compact
                required
                className="resize-vertical"
                onChange={e =>
                  setDNSEntry({
                    ...dnsEntry,
                    targets: e.target.value.split('\n'),
                  })
                }
                value={dnsEntry.targets.join('\n')}
                placeholder="Target records (CNAME or A records), one per line"
              />
            }
          />
        </FormFieldset>
      </CreateForm.Section>
    </>
  );
}
