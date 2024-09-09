import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { useTranslation } from 'react-i18next';
import ResourceQuotaCreate from './ResourceQuotaCreate';
import { Button } from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { useUrl } from 'hooks/useUrl';
import pluralize from 'pluralize';
import ResourceQuotaLimits, { ResourceQuotaProps } from './ResourceQuotaLimits';

export function ResourceQuotasList(props: any) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [, setLayoutColumn] = useRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const { namespaceUrl } = useUrl();

  const customColumns = [
    {
      header: 'Popin',
      value: (quota: ResourceQuotaProps) => (
        <ResourceQuotaLimits resource={quota} isCompact />
      ),
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
    setIsFormOpen({ formOpen: true, leavingForm: false });
    navigate(
      namespaceUrl(`${pluralize(props.resourceType.toLowerCase() || '')}`),
    );
  };

  const createButton = (
    <Button
      key={`create-resource-quotas`}
      data-testid={`create-resource-quotas`}
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
      displayArrow={false}
      resourceTitle={t('resource-quotas.title')}
      customColumns={customColumns}
      {...props}
      createResourceForm={ResourceQuotaCreate}
      listHeaderActions={createButton}
    />
  );
}

export default ResourceQuotasList;
