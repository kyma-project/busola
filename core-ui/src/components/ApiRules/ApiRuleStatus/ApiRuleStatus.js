import React from 'react';
import PropTypes from 'prop-types';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useTranslation } from 'react-i18next';

ApiRuleStatus.propTypes = {
  code: PropTypes.oneOf(['OK', 'SKIPPED', 'ERROR']),
  description: PropTypes.string,
};

const resolveAPIRuleStatus = statusCode => {
  switch (statusCode) {
    case 'OK':
      return 'success';
    case 'SKIPPED':
      return 'warning';
    case 'ERROR':
      return 'error';
    default:
      return undefined;
  }
};

export default function ApiRuleStatus({ apiRule }) {
  const { t, i18n } = useTranslation();

  const { code, desc } = apiRule?.status?.APIRuleStatus || {};

  return (
    <StatusBadge
      i18n={i18n}
      resourceKind="api-rules"
      type={resolveAPIRuleStatus(code)}
      additionalContent={desc}
    >
      {code || t('common.statuses.unknown')}
    </StatusBadge>
  );
}
