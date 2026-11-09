import { useTranslation } from 'react-i18next';

import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import {
  ResourceDetails,
  ResourceDetailsProps,
} from 'shared/components/ResourceDetails/ResourceDetails';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';

import { PersistentVolumesList } from './PersistentVolumesList';
import { PersistentVolumeClaimsList } from './PersistentVolumeClaimsList';
import StorageClassCreate from './StorageClassCreate';
import { FormGroup, FormItem, Text } from '@ui5/webcomponents-react';
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
        <ResourceDetailsForm>
          <FormGroup>
            <ResourceDetailsFormItem
              label={t('storage-classes.headers.provisioner')}
              value={storageclass.provisioner}
            />
            <ResourceDetailsFormItem
              label={t('storage-classes.headers.reclaim-policy')}
              value={storageclass.reclaimPolicy}
            />
            <ResourceDetailsFormItem
              label={t('storage-classes.headers.volume-binding-mode')}
              value={storageclass.volumeBindingMode}
            />
            <ResourceDetailsFormItem
              label={t('storage-classes.headers.allow-volume-expansion')}
              value={storageclass.allowVolumeExpansion}
            />
          </FormGroup>
          <FormGroup headerText={t('storage-classes.headers.parameters')}>
            {Object.keys(parameters).length > 0 ? (
              Object.entries(parameters).map((parameter: [string, any]) => {
                return (
                  <ResourceDetailsFormItem
                    label={parameter[0]}
                    value={parameter[1]}
                    key={parameter[0]}
                  />
                );
              })
            ) : (
              <FormItem>
                <Text>{t('common.messages.no-entries-found')}</Text>
              </FormItem>
            )}
          </FormGroup>
        </ResourceDetailsForm>
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
