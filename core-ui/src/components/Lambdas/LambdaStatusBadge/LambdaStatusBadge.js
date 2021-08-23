import React from 'react';

import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

import {
  LAMBDA_PHASES,
  LAMBDA_ERROR_PHASES,
} from 'components/Lambdas/constants';

import { statusType } from 'components/Lambdas/helpers/lambdas';
import { getLambdaStatus } from '../helpers/lambdas/getLambdaStatus';

export function LambdaStatusBadge({ status }) {
  const translatedStatus = getLambdaStatus(status);
  const statusPhase = translatedStatus.phase;
  const { t } = useTranslation();

  const texts = LAMBDA_PHASES[statusPhase];
  let badgeType = statusType(statusPhase);
  if (badgeType === 'info') {
    badgeType = undefined;
  }

  let tooltipText;

  if (LAMBDA_ERROR_PHASES.includes(statusPhase)) {
    const formattedError = t('common.messages.error', {
      error: translatedStatus.message,
    });
    tooltipText = `${texts.MESSAGE} ${formattedError}`;
  }

  return (
    <StatusBadge tooltipContent={tooltipText} type={badgeType}>
      {texts.TITLE}
    </StatusBadge>
  );
}
