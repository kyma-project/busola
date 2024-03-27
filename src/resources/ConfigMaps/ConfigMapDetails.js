import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';

import ConfigMapCreate from './ConfigMapCreate';
import { ResourceDescription } from 'resources/ConfigMaps';

export function ConfigMapDetails(props) {
  const { t } = useTranslation();

  const ConfigMapEditor = resource => {
    const { data } = resource;
    return Object.keys(data || {}).map(key => (
      <ReadonlyEditorPanel
        title={key}
        value={data[key]}
        key={key + JSON.stringify(data[key])}
      />
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
      description={ResourceDescription}
      createResourceForm={ConfigMapCreate}
      {...props}
    />
  );
}

export default ConfigMapDetails;
