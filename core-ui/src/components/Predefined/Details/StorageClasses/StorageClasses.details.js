import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { PersistentVolumesList } from './PersistentVolumesList';
import { PersistentVolumeClaimsList } from './PersistentVolumeClaimsList';

import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';

export const StorageClassesDetails = ({ DefaultRenderer, ...otherParams }) => {
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
      namespace={otherParams.namespace}
      filter={filterByResource('StorageClass', otherParams.resourceName)}
      hideInvolvedObjects={true}
    />
  );
  return (
    <DefaultRenderer
      customComponents={[
        StorageClassParameters,
        PersistentVolumesList,
        PersistentVolumeClaimsList,
        Events,
      ]}
      customColumns={customColumns}
      singularName={t('storage-classes.name_singular')}
      {...otherParams}
    />
  );
};
