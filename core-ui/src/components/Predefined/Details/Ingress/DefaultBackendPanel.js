import React from 'react';
import { useTranslation } from 'react-i18next';
import { GoToDetailsLink } from 'shared/components/ControlledBy/ControlledBy';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { LayoutPanel } from 'fundamental-react';
import { Link } from 'shared/components/Link/Link';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';

export const DefaultBackendPanel = ({ backend }) => {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md default-backend-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('ingresses.labels.default-backend')} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {backend.service && (
          <>
            {backend.service.name && (
              <LayoutPanelRow
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
                <LayoutPanelRow
                  name={t('ingresses.labels.port-name')}
                  value={backend?.service.port.name || EMPTY_TEXT_PLACEHOLDER}
                />
                <LayoutPanelRow
                  name={t('ingresses.labels.port-number')}
                  value={backend?.service.port.number || EMPTY_TEXT_PLACEHOLDER}
                />
              </>
            )}
          </>
        )}

        {backend.resource && (
          <>
            <LayoutPanelRow
              name={t('ingresses.labels.apiGroup')}
              value={backend.resource.apiGroup || EMPTY_TEXT_PLACEHOLDER}
            />
            <LayoutPanelRow
              name={t('ingresses.labels.kind')}
              value={backend.resource.kind || EMPTY_TEXT_PLACEHOLDER}
            />
            <LayoutPanelRow
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
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
