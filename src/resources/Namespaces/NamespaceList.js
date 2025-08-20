import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { showHiddenNamespacesAtom } from 'state/preferences/showHiddenNamespacesAtom';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import NamespaceCreate from './NamespaceCreate';
import { NamespaceStatus } from './NamespaceStatus';
import { useNavigate } from 'react-router';
import { clusterAtom } from 'state/clusterAtom';
import { useHasPermissionsFor } from 'hooks/useHasPermissionsFor';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/Namespaces';

export function NamespaceList(props) {
  const { t } = useTranslation();
  const showHiddenNamespaces = useAtomValue(showHiddenNamespacesAtom);
  const cluster = useAtomValue(clusterAtom);
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

  useEffect(() => {
    if (!hasPermissions) {
      navigate(`/cluster/${encodeURIComponent(cluster.name)}/no-permissions`);
    }
  }, [cluster.name, hasPermissions, navigate]);

  return (
    <ResourcesList
      customColumns={customColumns}
      description={ResourceDescription}
      filter={namespaceFilter}
      {...props}
      createResourceForm={NamespaceCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
        buttonText: 'Connect',
      }}
    />
  );
}

export default NamespaceList;
