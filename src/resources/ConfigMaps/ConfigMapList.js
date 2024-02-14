import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';

import { ConfigMapCreate } from './ConfigMapCreate';
import { description } from './ConfigMapDescription';

export function ConfigMapList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledBy
          ownerReferences={resource.metadata.ownerReferences}
          kindOnly
        />
      ),
    },
  ];

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      {...props}
      createResourceForm={ConfigMapCreate}
      emptyListProps={{
        subtitleText: t('config-maps.description'),
        url: 'https://kubernetes.io/docs/concepts/configuration/configmap/',
      }}
    />
  );
}
export default ConfigMapList;
