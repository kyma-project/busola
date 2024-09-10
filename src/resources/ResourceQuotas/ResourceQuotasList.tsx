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
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function ResourceQuotasList(props: any) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [, setLayoutColumn] = useRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const { namespaceUrl } = useUrl();

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
      readOnly
    />
  );
}

export default ResourceQuotasList;
