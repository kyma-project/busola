import React from 'react';

import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

import {
  LAMBDA_PHASES,
  LAMBDA_ERROR_PHASES,
} from 'components/Lambdas/constants';

import { statusType } from 'components/Lambdas/helpers/lambdas';
import { getLambdaStatus } from '../helpers/lambdas/getLambdaStatus';

export function LambdaStatusBadge({ resourceKind, status }) {
  const translatedStatus = getLambdaStatus(status);
  const statusPhase = translatedStatus.phase;
  const { t, i18n } = useTranslation();

  let badgeType = statusType(statusPhase);
  if (badgeType === 'info') {
    badgeType = undefined;
  }
  let tooltipText;

  if (LAMBDA_ERROR_PHASES.includes(statusPhase)) {
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
      {LAMBDA_PHASES[statusPhase]}
    </StatusBadge>
  );
}
