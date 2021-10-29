import React from 'react';
import { useTranslation } from 'react-i18next';
import { parse } from '@datasert/cronjs-parser';
import { toString as cRonstrue } from 'cronstrue/i18n';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { MessageStrip } from 'fundamental-react';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { Presets } from 'shared/ResourceForm/components/Presets';

const presets = {
  '@yearly': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@hourly': '0 * * * *',
};

function readableSchedule(schedule, i18n) {
  try {
    return cRonstrue(schedule, { locale: i18n.language });
  } catch (_) {
    // handle custom values like '@hourly'
    return schedule;
  }
}

export function isCronExpressionValid(schedule) {
  try {
    parse(schedule);
    return (
      Object.keys(presets).includes(schedule) ||
      schedule.split(' ').filter(e => e).length === 5
    );
  } catch (_) {
    return false;
  }
}

function TimeInput({ entries, index, name, setSchedule }) {
  const { t } = useTranslation();

  const setValue = v => {
    entries[index] = v;
    setSchedule(entries.join(' '));
  };

  return (
    <ResourceForm.FormField
      required
      label={t('cron-jobs.create-modal.' + name)}
      input={() => (
        <Inputs.Text
          value={entries[index] || ''}
          setValue={setValue}
          placeholder={t('cron-jobs.create-modal.' + name)}
          required
        />
      )}
      tooltipContent={t('cron-jobs.create-modal.tooltips.' + name)}
    />
  );
}

function ScheduleEditor({ schedule, setSchedule }) {
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
        <MessageStrip type="error" className="fd-margin-top--sm">
          {t('cron-jobs.create-modal.parse-error')}
        </MessageStrip>
      )}
      <p
        className="fd-margin-top--sm"
        style={{ color: 'var(--sapNeutralTextColor)' }}
      >
        {t('cron-jobs.create-modal.schedule-description')}
      </p>
    </>
  );
}

export function ScheduleSection({ value: schedule, setValue: setSchedule }) {
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
    <Presets
      onSelect={({ value }) => setSchedule(value)}
      presets={schedulePresets}
    />
  );

  return (
    <ResourceForm.CollapsibleSection
      title={`${t('cron-jobs.schedule')}: ${readableSchedule(schedule, i18n)}`}
      actions={presets}
      defaultOpen
    >
      <ScheduleEditor schedule={schedule} setSchedule={setSchedule} />
    </ResourceForm.CollapsibleSection>
  );
}
