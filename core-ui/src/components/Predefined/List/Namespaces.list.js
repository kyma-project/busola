import React from 'react';
import { NamespaceStatus } from '../Details/Namespace/NamespaceStatus';
import LuigiClient from '@luigi-project/client';
import { getFeatureToggle, ResourcesList } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';
import { NamespacesCreate } from '../Create/Namespaces/Namespaces.create';

const FilterNamespaces = namespace => {
  const showHiddenNamespaces = getFeatureToggle('showHiddenNamespaces');
  const hiddenNamespaces = LuigiClient.getContext().hiddenNamespaces;

  return showHiddenNamespaces
    ? true
    : !hiddenNamespaces.includes(namespace.metadata.name);
};

const NamespacesList = props => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: namespace => (
        <NamespaceStatus namespaceStatus={namespace.status} />
      ),
    },
  ];

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
      filter={FilterNamespaces}
      createResourceForm={NamespacesCreate}
      {...props}
    />
  );
};

export default NamespacesList;
