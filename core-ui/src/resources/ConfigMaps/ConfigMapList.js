import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { Link } from 'shared/components/Link/Link';

import { ConfigMapCreate } from './ConfigMapCreate';

export function ConfigMapList(props) {
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
      createResourceForm={ConfigMapCreate}
      {...props}
    />
  );
}
export default ConfigMapList;
