import React from 'react';
import {
  StatusBadge,
  GenericList,
  handleDelete,
  useNotification,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { CronSchedule } from 'shared/components/CronJobSchedule';
import { useDeleteHibernationSchedule } from './useDeleteHibernationSchedule';

const HibernationBadge = ({ enabled }) => {
  const { t } = useTranslation();

  const text = enabled
    ? t('common.messages.enabled')
    : t('common.messages.disabled');

  const type = enabled ? 'success' : 'info';

  return <StatusBadge type={type}>{text}</StatusBadge>;
};

export function ShootHibernationSchedule(shoot) {
  const { t, i18n } = useTranslation();
  const notification = useNotification();
  const hibernation = shoot.spec.hibernation;
  const deleteSchedule = useDeleteHibernationSchedule(shoot);

  const headerRenderer = () => [
    t('shoots.hibernation.start'),
    t('shoots.hibernation.end'),
    t('shoots.hibernation.location'),
  ];

  const rowRenderer = entry => [
    <CronSchedule schedule={entry.start} />,
    <CronSchedule schedule={entry.end} />,
    entry.location,
  ];

  const actions = [
    {
      name: t('common.buttons.delete'),
      handler: schedule => {
        handleDelete(
          t('shoots.hibernation.hibernation-schedule'),
          null,
          '',
          notification,
          () => deleteSchedule(schedule),
          () => {},
          t,
        );
      },
    },
  ];

  return (
    <GenericList
      title={t('shoots.hibernation.hibernation-schedule')}
      showSearchField={false}
      showSearchSuggestion={false}
      entries={hibernation.schedules}
      headerRenderer={headerRenderer}
      extraHeaderContent={<HibernationBadge enabled={hibernation.enabled} />}
      rowRenderer={rowRenderer}
      notFoundMessage={t('shoots.hibernation.no-schedules')}
      actions={actions}
      i18n={i18n}
    />
  );
}
