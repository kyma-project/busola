import { useTranslation } from 'react-i18next';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import {
  ResourceDetails,
  ResourceDetailsProps,
} from 'shared/components/ResourceDetails/ResourceDetails';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';

import { PersistentVolumesList } from './PersistentVolumesList';
import { PersistentVolumeClaimsList } from './PersistentVolumeClaimsList';
import StorageClassCreate from './StorageClassCreate';
import { Text } from '@ui5/webcomponents-react';
import { ResourceDescription } from 'resources/StorageClasses';

type StorageClassDetailsProps = {
  namespace: string;
  resourceName: string;
} & Omit<
  ResourceDetailsProps,
  | 'customComponents'
  | 'description'
  | 'resourceTitle'
  | 'singularName'
  | 'createResourceForm'
>;

export function StorageClassDetails(props: StorageClassDetailsProps) {
  const { t } = useTranslation();

  const StorageClassConfiguration = (storageclass: Record<string, any>) => {
    const parameters = storageclass?.parameters || [];

    return (
      <UI5Card
        keyComponent={'storageclass-configuration'}
        title={t('storage-classes.headers.configuration')}
        accessibleName={t('common.accessible-name.configuration')}
      >
        <LayoutPanelRow
          name={t('storage-classes.headers.provisioner')}
          value={storageclass.provisioner || EMPTY_TEXT_PLACEHOLDER}
        />
        <LayoutPanelRow
          name={t('storage-classes.headers.reclaim-policy')}
          value={storageclass.reclaimPolicy || EMPTY_TEXT_PLACEHOLDER}
        />
        <LayoutPanelRow
          name={t('storage-classes.headers.volume-binding-mode')}
          value={storageclass.volumeBindingMode || EMPTY_TEXT_PLACEHOLDER}
        />
        <LayoutPanelRow
          name={t('storage-classes.headers.allow-volume-expansion')}
          value={storageclass.allowVolumeExpansion || EMPTY_TEXT_PLACEHOLDER}
        />
        <UI5Card
          keyComponent={'storageclass-parameters'}
          title={t('storage-classes.headers.parameters')}
          accessibleName={t('storage-classes.accessible-name.parameters')}
        >
          {Object.keys(parameters).length > 0 ? (
            Object.entries(parameters).map((parameter: [string, any]) => {
              return (
                <LayoutPanelRow
                  name={parameter[0]}
                  value={parameter[1] || EMPTY_TEXT_PLACEHOLDER}
                  key={parameter[0]}
                />
              );
            })
          ) : (
            <Text>{t('common.messages.no-entries-found')}</Text>
          )}
        </UI5Card>
      </UI5Card>
    );
  };

  const Events = () => (
    <EventsList
      key="events"
      namespace={props.namespace}
      filter={filterByResource('StorageClass', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  return (
    <ResourceDetails
      customComponents={[
        StorageClassConfiguration,
        PersistentVolumesList,
        PersistentVolumeClaimsList,
        Events,
      ]}
      description={ResourceDescription}
      resourceTitle={t('storage-classes.title')}
      createResourceForm={StorageClassCreate}
      {...props}
    />
  );
}

export default StorageClassDetails;
