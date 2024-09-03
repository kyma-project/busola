import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import LimitRangeCreate from './LimitRangeCreate';
import LimitRangeSpecification from './LimitRangeSpecification';
import { Button } from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { useUrl } from 'hooks/useUrl';
import pluralize from 'pluralize';

export function LimitRangesList(props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [, setLayoutColumn] = useRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const { namespaceUrl } = useUrl();

  const customColumns = [
    {
      header: 'Popin',
      value: limit => <LimitRangeSpecification resource={limit} isCompact />,
    },
  ];

  const handleShowCreate = () => {
    setLayoutColumn({
      midColumn: null,
      endColumn: null,
      showCreate: {
        resourceType: props.resourceType,
        namespaceId: props.namespace,
      },
      layout: 'TwoColumnsMidExpanded',
    });
    setIsFormOpen({ formOpen: true });
    navigate(
      namespaceUrl(`${pluralize(props.resourceType.toLowerCase() || '')}`),
    );
  };

  const createButton = (
    <Button
      key={`create-limit-ranges`}
      data-testid={`create-limit-ranges`}
      design="Emphasized"
      onClick={handleShowCreate}
    >
      {t('components.resources-list.create')}
    </Button>
  );

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
      listHeaderActions={createButton}
    />
  );
}
