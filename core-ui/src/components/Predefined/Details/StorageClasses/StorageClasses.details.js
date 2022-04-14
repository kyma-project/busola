import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { PersistentVolumesList } from './PersistentVolumesList';
import { PersistentVolumeClaimsList } from './PersistentVolumeClaimsList';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { StorageClassesCreate } from '../../Create/StorageClasses/StorageClasses.create';

const StorageClassesDetails = props => {
  const { t } = useTranslation();

  const StorageClassParameters = storageclass => {
    const parameters = storageclass?.parameters || [];

    return (
      <LayoutPanel className="fd-margin--md" key={'storageclass-parameters'}>
        <LayoutPanel.Header>
          <LayoutPanel.Head title={t('storage-classes.headers.parameters')} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          {Object.keys(parameters).length > 0 ? (
            Object.entries(parameters).map(parameters => {
              return (
                <LayoutPanelRow
                  name={parameters[0]}
                  value={parameters[1] || EMPTY_TEXT_PLACEHOLDER}
                  key={parameters[0]}
                />
              );
            })
          ) : (
            <p className="no-entries-message body-fallback">
              {t('common.messages.no-entries-found')}
            </p>
          )}
        </LayoutPanel.Body>
      </LayoutPanel>
    );
  };

  const customColumns = [
    {
      header: t('storage-classes.headers.provisioner'),
      value: ({ provisioner }) => (
        <p>{provisioner || EMPTY_TEXT_PLACEHOLDER}</p>
      ),
    },
    {
      header: t('storage-classes.headers.reclaim-policy'),
      value: ({ reclaimPolicy }) => (
        <p>{reclaimPolicy || EMPTY_TEXT_PLACEHOLDER}</p>
      ),
    },
  ];

  const Events = () => (
    <EventsList
      namespace={props.namespace}
      filter={filterByResource('StorageClass', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  return (
    <ResourceDetails
      customComponents={[
        StorageClassParameters,
        PersistentVolumesList,
        PersistentVolumeClaimsList,
        Events,
      ]}
      customColumns={customColumns}
      resourceTitle={t('storage-classes.title')}
      singularName={t('storage-classes.name_singular')}
      createResourceForm={StorageClassesCreate}
      {...props}
    />
  );
};
export default StorageClassesDetails;
