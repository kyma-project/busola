import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const GenericAddonsConfigurationsList = ({
  descriptionKey,
  documentationLink,
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();

  const statusColumn = {
    header: t('common.headers.status'),
    value: addon => (
      <StatusBadge autoResolveType>{addon.status?.phase}</StatusBadge>
    ),
  };

  const description = (
    <Trans i18nKey={descriptionKey}>
      <Link className="fd-link" url={documentationLink} />
    </Trans>
  );

  const customColumns = [statusColumn];
  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
// cluster-addons.description
export function AddonsConfigurationsList(props) {
  return (
    <GenericAddonsConfigurationsList
      descriptionKey={'addons.description'}
      documentationLink={
        'https://kyma-project-old.netlify.app/docs/components/helm-broker#custom-resource-addons-configuration'
      }
      {...props}
    />
  );
}

export function ClusterAddonsConfigurationsList(props) {
  return (
    <GenericAddonsConfigurationsList
      descriptionKey={'cluster-addons.description'}
      documentationLink={
        'https://kyma-project-old.netlify.app/docs/components/helm-broker#custom-resource-cluster-addons-configuration'
      }
      {...props}
    />
  );
}
