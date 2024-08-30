import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import LimitRangeCreate from './LimitRangeCreate';
import { docsURL, i18nDescriptionKey } from '.';

export default function LimitRangeList(props: any) {
  const { t } = useTranslation();

  return (
    <ResourcesList
      resourceTitle={t('limit-ranges.title')}
      {...props}
      createResourceForm={LimitRangeCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}
