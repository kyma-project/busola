import React from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { useTranslation } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';
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
