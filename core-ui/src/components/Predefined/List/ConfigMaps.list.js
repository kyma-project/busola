import React from 'react';
import { ControlledByKind, ResourcesList } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';
import { ConfigMapsCreate } from '../Create/ConfigMaps/ConfigMaps.create';

const ConfigMapsList = props => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledByKind ownerReferences={resource.metadata.ownerReferences} />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="config-maps.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/configuration/configmap/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={ConfigMapsCreate}
      {...props}
    />
  );
};
export default ConfigMapsList;
