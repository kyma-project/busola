import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

const toSeconds = 1000;
const toMinutes = 60;
const toHours = 60;
const toDays = 24;

export const ROUNDING_RESULT_TYPE = {
  SECONDS: 'SECONDS',
  MINUTES: 'MINUTES',
  HOURS: 'HOURS',
  DAYS: 'DAYS',
} as const;

//eslint-disable-next-line @typescript-eslint/no-redeclare
export type ROUNDING_RESULT_TYPE =
  (typeof ROUNDING_RESULT_TYPE)[keyof typeof ROUNDING_RESULT_TYPE];

export const getElapsedTime = (
  timestamp: string,
  valueUnit: string,
  roundingResultType: ROUNDING_RESULT_TYPE,
): string => {
  if (!timestamp) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  const startDate = new Date(timestamp);
  const now = new Date();
  const timeDiff = now.valueOf() - startDate.valueOf();

  const timeElapsed = (function () {
    switch (roundingResultType) {
      case ROUNDING_RESULT_TYPE.SECONDS:
        return timeDiff / toSeconds;
      case ROUNDING_RESULT_TYPE.MINUTES:
        return timeDiff / toSeconds / toMinutes;
      case ROUNDING_RESULT_TYPE.HOURS:
        return timeDiff / toSeconds / toMinutes / toHours;
      default:
        return timeDiff / toSeconds / toMinutes / toHours / toDays;
    }
  })();

  const timeDiffRounded = Math.round(timeElapsed);

  return timeDiffRounded.toString() + ' ' + valueUnit;
};

export const ReadableElapsedTimeFromNow = ({
  timestamp,
  roundingResultType = ROUNDING_RESULT_TYPE.DAYS,
}: {
  timestamp: string;
  roundingResultType?: ROUNDING_RESULT_TYPE;
}): JSX.Element => {
  const { t } = useTranslation();
  const valueUnit = useMemo(() => {
    switch (roundingResultType) {
      case ROUNDING_RESULT_TYPE.SECONDS:
        return t('common.value-units.seconds-ago');
      case ROUNDING_RESULT_TYPE.MINUTES:
        return t('common.value-units.minutes-ago');
      case ROUNDING_RESULT_TYPE.HOURS:
        return t('common.value-units.hours-ago');
      default:
        return t('common.value-units.days-ago');
    }
  }, [roundingResultType, t]);

  return <>{getElapsedTime(timestamp, valueUnit, roundingResultType)}</>;
};
