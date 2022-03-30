import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { BusyIndicator, MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Link } from 'shared/components/Link/Link';
import './LogsLink.scss';

export const LogsLink = ({
  className,
  query,
  from = 'now-1h',
  to = 'now',
  dataSource = 'Loki',
  i18n,
  children,
}) => {
  const { features } = useMicrofrontendContext();
  const { data, loading, error } = useGet(
    '/apis/networking.istio.io/v1beta1/namespaces/kyma-system/virtualservices/monitoring-grafana',
  );
  const { t } = useTranslation(null, { i18n });

  if (!features.OBSERVABILITY?.isEnabled) {
    return null;
  }

  if (loading) {
    return (
      <BusyIndicator
        className={classNames('logs-link', 'loading', className)}
        show
        size="s"
      />
    );
  }

  if (error) {
    return (
      <Tooltip
        className={classNames('logs-link', 'invalid', className)}
        content={t('grafana.not-exposed')}
        delay={0}
      >
        <MessageStrip type="warning">{t('grafana.unavailable')}</MessageStrip>
      </Tooltip>
    );
  }

  const domain = data.spec?.hosts?.[0];
  if (!domain) {
    return (
      <Tooltip
        className={classNames('logs-link', 'invalid', className)}
        content={t('grafana.missing-domain')}
        delay={0}
      >
        <MessageStrip type="warning">{t('grafana.unavailable')}</MessageStrip>
      </Tooltip>
    );
  }

  const queryParameters = query ? { expr: query } : {};
  const parameters = [from, to, dataSource, queryParameters];
  const grafanaLink = `https://${domain}/explore?left=${JSON.stringify(
    parameters,
  )}`;

  return (
    <Link
      className={classNames('logs-link', 'fd-button', className)}
      url={grafanaLink}
      text={children || t('grafana.logs')}
      disabled
    />
  );
};

LogsLink.propTypes = {
  query: PropTypes.string.isRequired,
  className: PropTypes.string,
  from: PropTypes.string,
  to: PropTypes.string,
  dataSource: PropTypes.string,
  i18n: PropTypes.object,
};
