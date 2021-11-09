import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetList } from 'react-shared';
import { FormField } from 'shared/ResourceForm/components/FormComponents';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

export function useServicesQuery(namespace) {
  const EXCLUDED_SERVICES_LABEL_KEYS = ['serving.knative.dev/revision'];

  const isNotExcluded = labelKey =>
    !EXCLUDED_SERVICES_LABEL_KEYS.includes(labelKey);

  const filterServices = service => {
    const labelKeys = Object.keys(service?.metadata?.labels || {});

    return labelKeys.every(isNotExcluded);
  };

  return useGetList(filterServices)(
    `/api/v1/namespaces/${namespace}/services`,
    { pollingInterval: 8000 },
  );
}

export function ServiceDropdown({
  servicesQuery,
  value: service,
  setValue: setService,
}) {
  const { t } = useTranslation();
  const { data: services, error, loading } = servicesQuery;

  const dropdownOptions = (services || []).flatMap(svc => {
    const name = svc.metadata.name;

    return svc.spec.ports.map(({ port }) => ({
      key: name + ' ' + port,
      text: `${name} (port: ${port})`,
      name,
      port,
    }));
  });

  return (
    <FormField
      advanced
      required
      propertyPath="$.spec.service"
      label={t('common.labels.service')}
      placeholder={t('api-rules.services.placeholder')}
      selectedKey={service?.name + ' ' + service?.port}
      setValue={(_, { name, port }) => {
        setService({
          ...service,
          name,
          port,
        });
      }}
      input={Inputs.Dropdown}
      options={dropdownOptions}
      loading={loading}
      error={error}
    />
  );
}
