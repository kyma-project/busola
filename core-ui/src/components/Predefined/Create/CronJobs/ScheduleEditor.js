import React from 'react';
import { useTranslation } from 'react-i18next';
import { parse } from '@datasert/cronjs-parser';
import { toString as cRonstrue } from 'cronstrue/i18n';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { MessageStrip } from 'fundamental-react';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import './ScheduleEditor.scss';

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
    return schedule.split(/\s+/g).filter(e => e).length === 5;
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

  const presets = {
    '@yearly': '0 0 1 1 *',
    '@monthly': '0 0 1 * *',
    '@weekly': '0 0 * * 0',
    '@hourly': '0 * * * *',
  };

  const entries = (presets[schedule] || schedule || '')
    .split(/\s+/g)
    .filter(e => e);

  return (
    <>
      <ResourceForm.FormField
        required
        label={t('cron-jobs.schedule')}
        input={() => (
          <Inputs.Text value={schedule} setValue={setSchedule} required />
        )}
      />
      <div className="schedule-editor">
        <TimeInput
          entries={entries}
          index={0}
          name="minute"
          setSchedule={setSchedule}
        />
        <TimeInput
          entries={entries}
          index={1}
          name="hour"
          setSchedule={setSchedule}
        />
        <TimeInput
          entries={entries}
          index={2}
          name="day-of-month"
          setSchedule={setSchedule}
        />
        <TimeInput
          entries={entries}
          index={3}
          name="month"
          setSchedule={setSchedule}
        />
        <TimeInput
          entries={entries}
          index={4}
          name="day-of-week"
          setSchedule={setSchedule}
        />
      </div>
      {!isCronExpressionValid(schedule) && (
        <MessageStrip type="error" className="fd-margin-top--sm">
          {t('cron-jobs.create-modal.parse-error')}
        </MessageStrip>
      )}
    </>
  );
}

export function ScheduleSection({ value: schedule, setValue: setSchedule }) {
  const { t, i18n } = useTranslation();
  return (
    <ResourceForm.CollapsibleSection
      title={`${t('cron-jobs.schedule')}: ${readableSchedule(schedule, i18n)}`}
      defaultOpen
    >
      <ScheduleEditor schedule={schedule} setSchedule={setSchedule} />
    </ResourceForm.CollapsibleSection>
  );
}
