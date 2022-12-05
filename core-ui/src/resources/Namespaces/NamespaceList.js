import React from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation, Trans } from 'react-i18next';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { NamespaceCreate } from './NamespaceCreate';
import { NamespaceStatus } from './NamespaceStatus';

export function NamespaceList(props) {
  const { t } = useTranslation();
  const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);
  const hiddenNamespaces = useGetHiddenNamespaces();

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
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      filter={namespaceFilter}
      {...props}
      createResourceForm={NamespaceCreate}
    />
  );
}

export default NamespaceList;
