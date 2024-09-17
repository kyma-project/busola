import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ResourceDescription, docsURL, i18nDescriptionKey } from '.';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import ResourceQuotaCreate from './ResourceQuotaCreate';
import { ResourceQuotaProps } from './ResourceQuotaDetails';

export default function ResourceQuotaList(props: any) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('resource-quotas.headers.limits.cpu'),
      value: (quota: ResourceQuotaProps) =>
        quota.spec?.hard?.['limits.cpu'] || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('resource-quotas.headers.limits.memory'),
      value: (quota: ResourceQuotaProps) =>
        quota.spec?.hard?.['limits.memory'] || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('resource-quotas.headers.requests.cpu'),
      value: (quota: ResourceQuotaProps) =>
        quota.spec?.hard?.['requests.cpu'] ||
        quota.spec?.hard?.cpu ||
        EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('resource-quotas.headers.requests.memory'),
      value: (quota: ResourceQuotaProps) =>
        quota.spec?.hard?.['requests.memory'] ||
        quota.spec?.hard?.memory ||
        EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <ResourcesList
      resourceTitle={t('limit-ranges.title')}
      description={ResourceDescription}
      {...props}
      createResourceForm={ResourceQuotaCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
      customColumns={customColumns}
    />
  );
}
