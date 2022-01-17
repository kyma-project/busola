import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { PersistentVolumesList } from 'shared/components/PersistentVolumesList';
import { PersistentVolumeClaimsList } from 'shared/components/PersistentVolumeClaimsList';

import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

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

  return (
    <DefaultRenderer
      customComponents={[
        StorageClassParameters,
        PersistentVolumesList,
        PersistentVolumeClaimsList,
      ]}
      customColumns={customColumns}
      singularName={t('storage-classes.name_singular')}
      {...otherParams}
    />
  );
};
