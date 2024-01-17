import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation, Trans } from 'react-i18next';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { NamespaceCreate } from './NamespaceCreate';
import { NamespaceStatus } from './NamespaceStatus';
import { useNavigate } from 'react-router-dom';
import { clusterState } from 'state/clusterAtom';
import { useHasPermissionsFor } from 'hooks/useHasPermissionsFor';

export function NamespaceList(props) {
  const { t } = useTranslation();
  const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);
  const cluster = useRecoilValue(clusterState);
  const hiddenNamespaces = useGetHiddenNamespaces();
  const navigate = useNavigate();
  const [hasPermissions] = useHasPermissionsFor([['', 'namespaces', ['list']]]);

  const customColumns = [
    {
      header: t('common.headers.status'),
      value: namespace => (
        <NamespaceStatus namespaceStatus={namespace.status} />
      ),
    },
  ];

  const namespaceFilter = namespace => {
    return showHiddenNamespaces
      ? true
      : !hiddenNamespaces.includes(namespace.metadata.name);
  };

  const description = (
    <Trans i18nKey="namespaces.description">
      <Link
        className="bsl-link"
        url="https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces"
      />
    </Trans>
  );

  useEffect(() => {
    if (!hasPermissions) {
      navigate(`/cluster/${cluster.name}/no-permissions`);
    }
  }, [cluster.name, hasPermissions, navigate]);

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      filter={namespaceFilter}
      {...props}
      createResourceForm={NamespaceCreate}
      emptyListProps={{
        subtitleText: t('namespaces.description'),
        url:
          'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces',
        buttonText: 'Connect',
      }}
    />
  );
}

export default NamespaceList;
