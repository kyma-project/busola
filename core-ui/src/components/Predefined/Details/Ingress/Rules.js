import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { LayoutPanel, FormItem, FormLabel, Button } from 'fundamental-react';

const SecretComponent = ({ name, value }) => (
  <FormItem className="item-wrapper">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <FormLabel className="form-label">{name}:</FormLabel>
      <div>{value}</div>
    </div>
  </FormItem>
);

const getPort = (serviceName, port) => {
  if (port?.number) {
    return port.name
      ? `${port.name}:${port.number}`
      : `${serviceName}:${port.number}`;
  } else {
    return '';
  }
};

Rules.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default function Rules({ rules }) {
  const { t } = useTranslation();
  console.log('rules', rules);
  const RulesComponent = ({ path }) => {
    console.log('path', path);
    return (
      <>
        <LayoutPanel.Header>
          <LayoutPanel.Head title={path.path} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <SecretComponent
            name={t('ingresses.labels.path')}
            value={path.path}
          />

          {path.pathType && (
            <SecretComponent
              name={t('ingresses.labels.path-type')}
              value={path.pathType}
            />
          )}
          {path.backend?.service?.port && (
            <SecretComponent
              name={t('ingresses.labels.port')}
              value={getPort(
                path.backend?.service.name,
                path.backend?.service?.port,
              )}
            />
          )}
        </LayoutPanel.Body>
      </>
    );
  };

  const Wrapper = ({ children }) => (
    <div className="rule-wrapper">{children}</div>
  );

  if (!rules) {
    return <Wrapper>{t('ingresses.message.rules-not-found')}</Wrapper>;
  }
  return (
    <>
      {rules.map(rule => (
        <LayoutPanel key={rule.host} className="fd-margin--md rule-panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={`${t('ingresses.labels.rules')} for ${rule.host}`}
            />
          </LayoutPanel.Header>

          <LayoutPanel.Body>
            <SecretComponent
              name={t('ingresses.labels.host')}
              value={rule.host}
            />
          </LayoutPanel.Body>
          {rule?.http?.paths.map(path => (
            <RulesComponent key={path.path} path={path} />
          ))}
        </LayoutPanel>
      ))}
    </>
  );
  return (
    <LayoutPanel className="fd-margin--md rule-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('ingresses.labels.rules')} />
      </LayoutPanel.Header>

      {rules.map(rule => (
        <RulesComponent key={rule.host} path={rule} />
      ))}
    </LayoutPanel>
  );
}
