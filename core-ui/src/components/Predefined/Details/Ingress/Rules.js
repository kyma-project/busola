import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  EMPTY_TEXT_PLACEHOLDER,
  GenericList,
  GoToDetailsLink,
} from 'react-shared';
import { LayoutPanel, Link } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import pluralize from 'pluralize';

const getPort = (serviceName, port) => {
  if (port?.number) {
    return port.name ? (
      `${port.name}:${port.number}`
    ) : (
      <>
        <Link
          onClick={() =>
            LuigiClient.linkManager()
              .fromContext('namespace')
              .navigate(`services/details/${serviceName}`)
          }
        >
          {serviceName}
        </Link>
        :{port.number}
      </>
    );
  } else {
    return EMPTY_TEXT_PLACEHOLDER;
  }
};

export const Rules = ({ rules }) => {
  const { t, i18n } = useTranslation();

  const Backend = ({ backend }) => {
    if (backend.service) {
      return getPort(backend?.service.name, backend?.service?.port);
    } else if (backend.resource) {
      return (
        <>
          <p>
            {t('ingresses.labels.apiGroup')}: {backend.resource.apiGroup}
          </p>
          <p>
            {t('ingresses.labels.kind')}: {backend.resource.kind}
          </p>
          <p>
            {t('common.labels.name')}:{' '}
            <GoToDetailsLink
              resource={pluralize(
                backend.resource.kind.toString().toLowerCase(),
              )}
              name={backend.resource.name}
              noBrackets
            />
          </p>
        </>
      );
    } else {
      return EMPTY_TEXT_PLACEHOLDER;
    }
  };

  return (
    <>
      {rules.map((rule, i) => (
        <LayoutPanel key={`rule.host${i}`} className="fd-margin--md rule-panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head title={t('ingresses.labels.rules')} />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            {rule.host && (
              <LayoutPanelRow
                name={t('ingresses.labels.host')}
                value={rule.host}
              />
            )}
          </LayoutPanel.Body>
          <GenericList
            className="fd-margin-top--none"
            key={`rules${i}`}
            title={t('ingresses.labels.paths')}
            showSearchField={false}
            headerRenderer={() => [
              t('ingresses.labels.path'),
              t('ingresses.labels.path-type'),
              t('ingresses.labels.backend'),
            ]}
            rowRenderer={path => [
              path.path,
              path.pathType,
              <Backend backend={path.backend} />,
            ]}
            entries={rule?.http?.paths}
            i18n={i18n}
          />
        </LayoutPanel>
      ))}
    </>
  );
};
