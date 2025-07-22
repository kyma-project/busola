import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';

import { Text } from '@ui5/webcomponents-react';
import './TimestampLabel.scss';

interface TimestampLabelProps {
  time: Date;
}

const checkIfIsToday = (date: Date, nowDate: Date) => {
  return (
    date.getDate() === nowDate.getDate() &&
    date.getMonth() === nowDate.getMonth() &&
    date.getFullYear() === nowDate.getFullYear()
  );
};

const checkIfIsYesterday = (date: Date, nowDate: Date) => {
  return (
    date.getDate() === nowDate.getDate() - 1 &&
    date.getMonth() === nowDate.getMonth() &&
    date.getFullYear() === nowDate.getFullYear()
  );
};

export default function TimestampLabel({ time }: TimestampLabelProps) {
  const [nowDate, setNowDate] = useState<Date>(new Date());
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setNowDate(new Date());
    }, 1000 * 5);
    return () => clearInterval(interval);
  }, []);

  const isToday = checkIfIsToday(time, nowDate);
  const isYesterday = checkIfIsYesterday(time, nowDate);

  return (
    <div className="timestamp-label">
      <Text className="timestamp-label-text">
        {(isToday || isYesterday) && (
          <>
            {isToday && <b>{t('kyma-companion.time.today')} </b>}
            {isYesterday && <b>{t('kyma-companion.time.yesterday')} </b>}
            {time.toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </>
        )}
        {!(isToday || isYesterday) &&
          time.toLocaleString('de-DE', {
            dateStyle: 'short',
            timeStyle: 'short',
            hour12: false,
          })}
      </Text>
    </div>
  );
}
