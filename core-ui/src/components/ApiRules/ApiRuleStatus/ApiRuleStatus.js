import React from 'react';
import PropTypes from 'prop-types';

import { StatusBadge } from 'react-shared';
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
  const { i18n } = useTranslation();

  if (!apiRule.status?.APIRuleStatus) {
    return null;
  }

  const { code, desc } = apiRule.status.APIRuleStatus;
  return (
    <StatusBadge
      i18n={i18n}
      resourceKind={apiRule.kind}
      type={resolveAPIRuleStatus(code)}
      tooltipContent={desc}
    >
      {code}
    </StatusBadge>
  );
}
