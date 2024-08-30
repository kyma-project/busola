import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import LimitRangeCreate from './LimitRangeCreate';

export function LimitRangesList(props) {
  const { t } = useTranslation();

  return (
    <ResourcesList
      disableHiding={true}
      simpleEmptyListMessage={true}
      resourceTitle={t('limit-ranges.title')}
      {...props}
      createResourceForm={LimitRangeCreate}
      displayArrow={false}
      isCompact
      readOnly
    />
  );
}
