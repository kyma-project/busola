import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import LimitRangeCreate from './LimitRangeCreate';
import LimitRangeSpecification from './LimitRangeSpecification';
import { Button } from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router';
import { useRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import pluralize from 'pluralize';

export function LimitRangesList(props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { namespaceUrl } = useUrl();

  const customColumns = [
    {
      header: 'Popin',
      value: limit => <LimitRangeSpecification resource={limit} isCompact />,
    },
  ];

  const handleShowCreate = () => {
    setLayoutColumn({
      startColumn: {
        resourceType: 'LimitRange',
        namespaceId: props.namespace,
        apiGroup: '',
        apiVersion: 'v1',
      },
      midColumn: null,
      endColumn: null,
      showCreate: {
        resourceType: props.resourceType,
        namespaceId: props.namespace,
        resourceUrl: props.resourceUrl,
      },
      layout: 'TwoColumnsMidExpanded',
    });
    navigate(
      namespaceUrl(
        `${pluralize(
          props.resourceType.toLowerCase() || '',
        )}?layout=TwoColumnsMidExpanded&showCreate=true`,
      ),
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
