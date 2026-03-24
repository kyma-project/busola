import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import LimitRangeCreate from './LimitRangeCreate';
import LimitRangeSpecification from './LimitRangeSpecification';
import { ToolbarButton } from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router';
import { useSetAtom } from 'jotai';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import pluralize from 'pluralize';

interface LimitRangesListProps {
  namespace: string;
  resourceType: string;
  resourceUrl: string;
  [key: string]: any;
}

export function LimitRangesList(props: LimitRangesListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const { namespaceUrl } = useUrl();

  const customColumns = [
    {
      header: 'Popin',
      value: (limit: any) => (
        <LimitRangeSpecification resource={limit} isCompact />
      ),
    },
  ];

  const handleShowCreate = () => {
    setLayoutColumn({
      startColumn: {
        resourceName: null,
        resourceType: 'LimitRange',
        rawResourceTypeName: 'LimitRange',
        namespaceId: props.namespace,
        apiGroup: '',
        apiVersion: 'v1',
      },
      midColumn: null,
      endColumn: null,
      showCreate: {
        resourceType: props.resourceType,
        rawResourceTypeName: props.resourceType,
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
    <ToolbarButton
      key={`create-limit-ranges`}
      data-testid={`create-limit-ranges`}
      onClick={handleShowCreate}
      text={t('components.resources-list.create')}
    />
  );

  return (
    <ResourcesList
      disableHiding={true}
      simpleEmptyListMessage={true}
      resourceTitle={t('limit-ranges.title')}
      {...(props as any)}
      createResourceForm={LimitRangeCreate}
      displayArrow={false}
      readOnly
      customColumns={customColumns}
      listHeaderActions={createButton}
    />
  );
}
