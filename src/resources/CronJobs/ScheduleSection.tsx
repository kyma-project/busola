import { useTranslation } from 'react-i18next';
import { parse } from '@datasert/cronjs-parser';
import { toString as cRonstrue } from 'cronstrue';
import { MessageStrip, Text } from '@ui5/webcomponents-react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { i18n } from 'i18next';

const presets: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@hourly': '0 * * * *',
};

function readableSchedule(schedule: string, i18n: i18n) {
  try {
    return cRonstrue(schedule, { locale: i18n.language });
  } catch (_) {
    // handle custom values like '@hourly'
    return schedule;
  }
}

export function isCronExpressionValid(schedule: string) {
  try {
    parse(schedule);
    return (
      Object.keys(presets).includes(schedule) ||
      schedule.split(' ').filter((e) => e).length === 5
    );
  } catch (_) {
    return false;
  }
}

function TimeInput({
  entries,
  index,
  name,
  setSchedule,
}: {
  entries: string[];
  index: number;
  name: string;
  setSchedule?: (value: string) => void;
}) {
  const { t } = useTranslation();

  const setValue = (v: string) => {
    const newEntries = [...entries];
    newEntries[index] = v;
    setSchedule?.(newEntries.join(' '));
  };

  return (
    <ResourceForm.FormField
      required
      label={t('cron-jobs.create-modal.' + name)}
      tooltipContent={t('cron-jobs.create-modal.tooltips.' + name)}
      input={() => (
        <Inputs.Text
          value={entries[index] || ''}
          setValue={setValue}
          placeholder={t('cron-jobs.create-modal.' + name)}
          className="full-width"
          required
          accessibleName={t('cron-jobs.create-modal.' + name)}
        />
      )}
    />
  );
}

function ScheduleEditor({
  schedule,
  setSchedule,
}: {
  schedule: string;
  setSchedule?: (value: string) => void;
}) {
  const { t } = useTranslation();

  const entries = (presets[schedule] || schedule || '').split(' ');

  const inputNames = ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'];

  return (
    <>
      {inputNames.map((name, i) => (
        <TimeInput
          entries={entries}
          index={i}
          key={i}
          name={name}
          setSchedule={setSchedule}
        />
      ))}
      {!isCronExpressionValid(schedule) && (
        <MessageStrip
          design="Negative"
          hideCloseButton
          className="sap-margin-top-small"
        >
          {t('cron-jobs.create-modal.parse-error')}
        </MessageStrip>
      )}
      <Text className="sap-margin-top-small">
        {t('cron-jobs.create-modal.schedule-description')}
      </Text>
    </>
  );
}

type ScheduleSectionProps = {
  value?: string;
  setValue?: (value: string) => void;
  tooltipContent?: string;
  propertyPath?: string; // used by Wrapper.
};

export function ScheduleSection({
  value: schedule = '',
  setValue: setSchedule,
  tooltipContent,
  propertyPath: _propertyPath, // used by Wrapper.
}: ScheduleSectionProps) {
  const { t, i18n } = useTranslation();

  const schedulePresets = [
    {
      name: t('cron-jobs.create-modal.presets.yearly'),
      value: '0 0 1 1 *',
    },
    {
      name: t('cron-jobs.create-modal.presets.monthly'),
      value: '0 0 1 * *',
    },
    {
      name: t('cron-jobs.create-modal.presets.weekly'),
      value: '0 0 * * 0',
    },
    {
      name: t('cron-jobs.create-modal.presets.daily'),
      value: '0 0 * * *',
    },
    {
      name: t('cron-jobs.create-modal.presets.hourly'),
      value: '0 * * * *',
    },
  ];

  const presets = (
    <ResourceForm.Presets
      onSelect={({ value }) => setSchedule?.(value)}
      presets={schedulePresets}
      inlinePresets={true}
    />
  );

  return (
    <ResourceForm.CollapsibleSection
      title={`${t('cron-jobs.schedule')}: ${readableSchedule(schedule, i18n)}`}
      tooltipContent={tooltipContent}
      actions={presets}
      defaultOpen
    >
      <ScheduleEditor schedule={schedule} setSchedule={setSchedule} />
    </ResourceForm.CollapsibleSection>
  );
}
