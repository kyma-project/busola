import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import LimitRangeCreate from './LimitRangeCreate';
import { ResourceDescription, docsURL, i18nDescriptionKey } from '.';
import { LimitRangeProps } from './LimitRangeDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export default function LimitRangeList(props: any) {
  const { t } = useTranslation();

  const findTypeIndex = (obj: LimitRangeProps) => {
    if (!obj || !obj.spec || !Array.isArray(obj.spec.limits)) {
      return -1;
    }

    const typePriority = ['Pod', 'Container', 'PersistentVolumeClaim'];

    for (const type of typePriority) {
      const index = obj.spec.limits.findIndex(limit => limit.type === type);
      if (index !== -1) {
        return index;
      }
    }

    return -1;
  };
  const customColumns = [
    {
      header: t('limit-ranges.headers.type'),
      value: (limit: LimitRangeProps) =>
        limit.spec.limits?.[findTypeIndex(limit)]?.type ||
        EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('limit-ranges.headers.max'),
      value: (limit: LimitRangeProps) =>
        limit.spec.limits?.[findTypeIndex(limit)]?.max?.memory ||
        EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('limit-ranges.headers.min'),
      value: (limit: LimitRangeProps) =>
        limit.spec.limits?.[findTypeIndex(limit)]?.min?.memory ||
        EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('limit-ranges.headers.default'),
      value: (limit: LimitRangeProps) =>
        limit.spec.limits?.[findTypeIndex(limit)]?.default?.memory ||
        EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('limit-ranges.headers.default-request'),
      value: (limit: LimitRangeProps) =>
        limit.spec.limits?.[findTypeIndex(limit)]?.defaultRequest?.memory ||
        EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <ResourcesList
      resourceTitle={t('limit-ranges.title')}
      description={ResourceDescription}
      {...props}
      createResourceForm={LimitRangeCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
      customColumns={customColumns}
    />
  );
}
