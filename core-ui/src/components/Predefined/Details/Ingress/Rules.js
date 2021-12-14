import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER, GenericList } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import { RowComponent } from './RowComponent';

const getPort = (serviceName, port) => {
  if (port?.number) {
    return port.name
      ? `${port.name}:${port.number}`
      : `${serviceName}:${port.number}`;
  } else {
    return EMPTY_TEXT_PLACEHOLDER;
  }
};

export const Rules = ({ rules }) => {
  const { t, i18n } = useTranslation();

  const Wrapper = ({ children }) => (
    <div className="rule-wrapper">{children}</div>
  );

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
            {t('common.labels.name')}: {backend.resource.name}
          </p>
        </>
      );
    } else {
      return EMPTY_TEXT_PLACEHOLDER;
    }
  };

  if (!rules) {
    return <Wrapper>{t('ingresses.message.rules-not-found')}</Wrapper>;
  }
  return (
    <>
      {rules.map(rule => (
        <LayoutPanel key={rule.host} className="fd-margin--md rule-panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head title={t('ingresses.labels.rule')} />
          </LayoutPanel.Header>
          {rule.host && (
            <RowComponent name={t('ingresses.labels.host')} value={rule.host} />
          )}
          <GenericList
            key="rules"
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
