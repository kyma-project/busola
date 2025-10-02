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

const formatResult = (value: number, valueUnit: string) => {
  return <>{Math.round(value).toString() + ' ' + valueUnit}</>;
};

export const ReadableElapsedTimeFromNow = ({
  timestamp,
  roundingResultType,
}: {
  timestamp: string;
  roundingResultType?: ROUNDING_RESULT_TYPE;
}): JSX.Element => {
  const { t } = useTranslation();

  const result = useMemo(() => {
    if (!timestamp) {
      return <>{EMPTY_TEXT_PLACEHOLDER}</>;
    }

    const startDate = new Date(timestamp);
    const now = new Date();
    const timeDiff = now.valueOf() - startDate.valueOf();

    const seconds = timeDiff / toSeconds;
    const minutes = seconds / toMinutes;
    const hours = minutes / toHours;
    const days = hours / toDays;

    if (
      (!!roundingResultType &&
        roundingResultType === ROUNDING_RESULT_TYPE.SECONDS) ||
      (!roundingResultType && seconds < 60)
    )
      return formatResult(seconds, t('common.value-units.seconds-ago'));
    else if (
      (!!roundingResultType &&
        roundingResultType === ROUNDING_RESULT_TYPE.MINUTES) ||
      (!roundingResultType && minutes < 60)
    )
      return formatResult(minutes, t('common.value-units.minutes-ago'));
    else if (
      (!!roundingResultType &&
        roundingResultType === ROUNDING_RESULT_TYPE.HOURS) ||
      (!roundingResultType && hours < 24)
    )
      return formatResult(hours, t('common.value-units.hours-ago'));
    else return formatResult(days, t('common.value-units.days-ago'));
  }, [timestamp, roundingResultType, t]);

  return result;
};
