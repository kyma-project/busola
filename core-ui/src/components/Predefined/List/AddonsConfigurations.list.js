import React from 'react';
import { ResourceStatus } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const GenericAddonsConfigurationsList = ({
  descriptionKey,
  documentationLink,
  DefaultRenderer,
  ...otherParams
}) => {
  const { t, i18n } = useTranslation();

  const statusColumn = {
    header: t('common.headers.status'),
    value: addon => (
      <ResourceStatus status={addon.status} resourceKind="addons" i18n={i18n} />
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
