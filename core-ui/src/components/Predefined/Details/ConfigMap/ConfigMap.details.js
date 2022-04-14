import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ConfigMapsCreate } from '../../Create/ConfigMaps/ConfigMaps.create';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

const ConfigMapsDetails = props => {
  const { t } = useTranslation();
  const ConfigMapEditor = resource => {
    const { data } = resource;
    return Object.keys(data || {}).map(key => (
      <ReadonlyEditorPanel title={key} value={data[key]} key={key} />
    ));
  };

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: secret => (
        <ControlledBy ownerReferences={secret.metadata.ownerReferences} />
      ),
    },
  ];

  return (
    <ResourceDetails
      customComponents={[ConfigMapEditor]}
      customColumns={customColumns}
      createResourceForm={ConfigMapsCreate}
      {...props}
    />
  );
};

export default ConfigMapsDetails;
