import React from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER, GoToDetailsLink } from 'react-shared';
import { LayoutPanel, Link } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { RowComponent } from './RowComponent';
import pluralize from 'pluralize';

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
              value={
                <Link
                  onClick={() =>
                    LuigiClient.linkManager()
                      .fromContext('namespace')
                      .navigate(`services/details/${backend?.service.name}`)
                  }
                >
                  {backend?.service.name}
                </Link>
              }
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
            value={
              (
                <GoToDetailsLink
                  resource={pluralize(
                    backend.resource.kind.toString().toLowerCase(),
                  )}
                  name={backend.resource.name}
                  noBrackets
                />
              ) || EMPTY_TEXT_PLACEHOLDER
            }
          />
        </>
      )}
    </LayoutPanel>
  );
};
