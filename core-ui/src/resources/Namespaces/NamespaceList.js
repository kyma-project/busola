import React from 'react';
import { NamespaceStatus } from './NamespaceStatus';
import LuigiClient from '@luigi-project/client';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { getFeatureToggle } from 'shared/hooks/useFeatureToggle';
import { useTranslation } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';
import { Trans } from 'react-i18next';
import { NamespaceCreate } from './NamespaceCreate';

const FilterNamespaces = namespace => {
  const showHiddenNamespaces = getFeatureToggle('showHiddenNamespaces');
  const hiddenNamespaces =
    LuigiClient.getContext().features.HIDDEN_NAMESPACES?.selector || [];

  return showHiddenNamespaces
    ? true
    : !hiddenNamespaces.includes(namespace.metadata.name);
};

export function NamespaceList(props) {
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
      createResourceForm={NamespaceCreate}
      {...props}
    />
  );
}

export default NamespaceList;
