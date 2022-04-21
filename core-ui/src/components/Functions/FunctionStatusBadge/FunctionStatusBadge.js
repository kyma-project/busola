import React from 'react';

import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { useTranslation } from 'react-i18next';

import {
  FUNCTION_PHASES,
  FUNCTION_ERROR_PHASES,
} from 'components/Functions/constants';

import { statusType } from 'components/Functions/helpers/functions';
import { getFunctionStatus } from '../helpers/functions/getFunctionStatus';

export function FunctionStatusBadge({ resourceKind, status }) {
  const translatedStatus = getFunctionStatus(status);
  const statusPhase = translatedStatus.phase;
  const { t, i18n } = useTranslation();

  let badgeType = statusType(statusPhase);
  if (badgeType === 'info') {
    badgeType = undefined;
  }
  let tooltipText;

  if (FUNCTION_ERROR_PHASES.includes(statusPhase)) {
    const formattedError = t('common.messages.error', {
      error: translatedStatus.message,
    });
    tooltipText = formattedError;
  }
  return (
    <StatusBadge
      i18n={i18n}
      resourceKind={resourceKind}
      additionalContent={tooltipText}
      type={badgeType}
    >
      {FUNCTION_PHASES[statusPhase]}
    </StatusBadge>
  );
}
