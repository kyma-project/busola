import React from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import { RowComponent } from './RowComponent';

export const DefaultBackendPanel = ({ backend }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md default-backend-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('ingresses.labels.default-backend')} />
      </LayoutPanel.Header>
      {backend.service && (
        <>
          {backend.service.name && (
            <RowComponent
              name={t('ingresses.labels.service-name')}
              value={backend?.service.name}
            />
          )}
          {backend.service?.port && (
            <>
              <RowComponent
                name={t('ingresses.labels.port-name')}
                value={backend?.service.port.name || EMPTY_TEXT_PLACEHOLDER}
              />
              <RowComponent
                name={t('ingresses.labels.port-number')}
                value={backend?.service.port.number || EMPTY_TEXT_PLACEHOLDER}
              />
            </>
          )}
        </>
      )}

      {backend.resource && (
        <>
          <RowComponent
            name={t('ingresses.labels.apiGroup')}
            value={backend.resource.apiGroup || EMPTY_TEXT_PLACEHOLDER}
          />
          <RowComponent
            name={t('ingresses.labels.kind')}
            value={backend.resource.kind || EMPTY_TEXT_PLACEHOLDER}
          />
          <RowComponent
            name={t('common.labels.name')}
            value={backend.resource.name || EMPTY_TEXT_PLACEHOLDER}
          />
        </>
      )}
    </LayoutPanel>
  );
};
