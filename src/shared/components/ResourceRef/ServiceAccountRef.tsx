import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useTranslation } from 'react-i18next';

import { ExternalResourceRef } from './ExternalResourceRef';

type ServiceAccountRefProps = {
  index: number;
  nestingLevel: number;
  setValue: ({ name, namespace }: { name: string; namespace: string }) => void;
  title: string;
  value: { name: string; namespace: string };
};

export function ServiceAccountRef({
  index,
  nestingLevel,
  setValue,
  title,
  value,
}: ServiceAccountRefProps) {
  const { t } = useTranslation();
  const { data: serviceaccounts, loading } = useGetList()(
    '/api/v1/serviceaccounts/',
  );

  return (
    <ExternalResourceRef
      defaultOpen
      resources={serviceaccounts}
      loading={loading}
      labelPrefix={t('role-bindings.labels.service-account')}
      index={index}
      nestingLevel={nestingLevel}
      setValue={setValue}
      title={title}
      value={value}
    />
  );
}
