import React from 'react';
import { NamespaceStatus } from '../Details/Namespace/NamespaceStatus';
import LuigiClient from '@luigi-project/client';
import { getFeatureToggle } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

const FilterNamespaces = namespace => {
  const showHiddenNamespaces = getFeatureToggle('showHiddenNamespaces');
  const hiddenNamespaces = LuigiClient.getContext().hiddenNamespaces;

  return showHiddenNamespaces
    ? true
    : !hiddenNamespaces.includes(namespace.metadata.name);
};

export const NamespacesList = ({ DefaultRenderer, ...otherParams }) => {
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
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      filter={FilterNamespaces}
      {...otherParams}
    />
  );
};
