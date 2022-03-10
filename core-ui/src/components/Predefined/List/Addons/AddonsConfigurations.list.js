import React from 'react';
import { ResourceStatus, Link, ResourcesList } from 'react-shared';
import { useTranslation, Trans } from 'react-i18next';
import { AddonsConfigurationsCreate } from '../../Create/AddonsConfigurations/AddonsConfigurations.create';

export const GenericAddonsConfigurationsList = ({
  descriptionKey,
  documentationLink,
  ...props
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
    <ResourcesList
      customColumns={customColumns}
      description={description}
      {...props}
    />
  );
};

function AddonsConfigurationsList(props) {
  return (
    <GenericAddonsConfigurationsList
      descriptionKey={'addons.description'}
      documentationLink={
        'https://kyma-project-old.netlify.app/docs/components/helm-broker#custom-resource-addons-configuration'
      }
      createResourceForm={AddonsConfigurationsCreate}
      {...props}
    />
  );
}

export default AddonsConfigurationsList;
