import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { useTranslation } from 'react-i18next';
import ResourceQuotaCreate from './ResourceQuotaCreate';
import { Button } from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router';
import { useRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import pluralize from 'pluralize';
import { ResourceQuota } from './ResourceQuotaDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function ResourceQuotasList(props: any) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { namespaceUrl } = useUrl();

  const customColumns = [
    {
      header: t('resource-quotas.headers.limits.cpu'),
      value: (quota: ResourceQuota) =>
        quota.spec?.hard?.['limits.cpu'] || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('resource-quotas.headers.limits.memory'),
      value: (quota: ResourceQuota) =>
        quota.spec?.hard?.['limits.memory'] || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('resource-quotas.headers.requests.cpu'),
      value: (quota: ResourceQuota) =>
        quota.spec?.hard?.['requests.cpu'] ||
        quota.spec?.hard?.cpu ||
        EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('resource-quotas.headers.requests.memory'),
      value: (quota: ResourceQuota) =>
        quota.spec?.hard?.['requests.memory'] ||
        quota.spec?.hard?.memory ||
        EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  const handleShowCreate = () => {
    setLayoutColumn({
      startColumn: {
        resourceName: null,
        resourceType: 'ResourceQuota',
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

  const createButton = !props?.disableCreate ? (
    <Button
      key={`create-resource-quotas`}
      data-testid={`create-resource-quotas`}
      design="Emphasized"
      onClick={handleShowCreate}
    >
      {t('components.resources-list.create')}
    </Button>
  ) : null;

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
