import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import useDateNow from 'shared/hooks/useDateNow';

const toSeconds = 1000;
const toMinutes = 60;
const toHours = 60;
const toDays = 24;

const formatResult = (value: number, valueUnit: string) => {
  return <>{Math.round(value).toString() + ' ' + valueUnit}</>;
};

type TimeFormat = 'elapsed' | 'age';

interface ReadableElapsedTimeFromNowProps {
  timestamp: string;
  format?: TimeFormat;
}

export const ReadableElapsedTimeFromNow = ({
  timestamp,
  format = 'elapsed',
}: ReadableElapsedTimeFromNowProps): JSX.Element => {
  const { t } = useTranslation();
  const now = useDateNow(10_000);

  const result = useMemo(() => {
    if (!timestamp) {
      return <>{EMPTY_TEXT_PLACEHOLDER}</>;
    }

    const startDate = new Date(timestamp);
    const timeDiff = Math.max(0, now - startDate.valueOf());

    const seconds = timeDiff / toSeconds;
    const minutes = seconds / toMinutes;
    const hours = minutes / toHours;
    const days = hours / toDays;

    const suffix = format === 'age' ? 'old' : 'ago';

    if (seconds < 60)
      return formatResult(seconds, t(`common.value-units.seconds-${suffix}`));
    else if (minutes < 60)
      return formatResult(minutes, t(`common.value-units.minutes-${suffix}`));
    else if (hours < 24)
      return formatResult(hours, t(`common.value-units.hours-${suffix}`));
    else return formatResult(days, t(`common.value-units.days-${suffix}`));
  }, [timestamp, t, now, format]);

  return result;
};
