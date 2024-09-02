import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import LimitRangeCreate from './LimitRangeCreate';
import LimitRangeSpecification from './LimitRangeSpecification';

export function LimitRangesList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: 'Popin',
      value: limit => <LimitRangeSpecification resource={limit} isCompact />,
    },
  ];

  return (
    <ResourcesList
      disableHiding={true}
      simpleEmptyListMessage={true}
      resourceTitle={t('limit-ranges.title')}
      {...props}
      createResourceForm={LimitRangeCreate}
      displayArrow={false}
      readOnly
      customColumns={customColumns}
    />
  );
}
