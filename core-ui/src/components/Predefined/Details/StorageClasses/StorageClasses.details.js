import React from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { GoToDetailsLink, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

export const StorageClassesDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const StorageClassParameters = storageclass => {
    const { t } = useTranslation();
    const parameters = storageclass?.parameters || [];
    console.log(storageclass);
    console.log(parameters);
    return (
      <LayoutPanel className="fd-margin--md" key={'storageclass-parameters'}>
        <LayoutPanel.Header>
          <LayoutPanel.Head title={t('storage-classes.headers.parameters')} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          {Object.keys(parameters).length > 0 ? (
            Object.entries(parameters).map(parameters => {
              return (
                <LayoutPanelRow name={parameters[0]} value={parameters[1]} />
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
        <p>{provisioner ? provisioner : EMPTY_TEXT_PLACEHOLDER}</p>
      ),
    },
    {
      header: t('storage-classes.headers.reclaim-policy'),
      value: ({ reclaimPolicy }) => (
        <p>{reclaimPolicy ? reclaimPolicy : EMPTY_TEXT_PLACEHOLDER}</p>
      ),
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[StorageClassParameters]}
      customColumns={customColumns}
      singularName={t('storage-classes.name_singular')}
      {...otherParams}
    />
  );
};
