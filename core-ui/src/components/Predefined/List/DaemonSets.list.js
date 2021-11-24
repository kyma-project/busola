import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledByKind, Labels, StatusBadge } from 'react-shared';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

const isStatusOk = daemonSet => {
  const allPods =
    daemonSet.status.numberReady + (daemonSet.status.numberUnavailable || 0);
  return daemonSet.status.numberReady === allPods;
};

export const getStatusType = daemonSet => {
  return isStatusOk(daemonSet) ? 'success' : 'error';
};

export const getPodsCount = daemonSet => {
  const allPods =
    daemonSet.status.numberReady + (daemonSet.status.numberUnavailable || 0);
  return `${daemonSet.status.numberReady || 0} / ${allPods || 0}`;
};

export const DaemonSetsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledByKind ownerReferences={resource.metadata.ownerReferences} />
      ),
    },
    {
      header: t('daemon-sets.node-selector'),
      value: resource => (
        <Labels
          labels={resource.spec.template.spec.nodeSelector}
          shortenLongLabels
        />
      ),
    },
    {
      header: t('daemon-sets.pods'),
      value: resource => {
        const podsCount = getPodsCount(resource);
        const statusType = getStatusType(resource);
        return <StatusBadge type={statusType}>{podsCount}</StatusBadge>;
      },
    },
  ];

  const description = (
    <Trans i18nKey="daemon-sets.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('daemon-sets.title')}
      description={description}
      {...otherParams}
    />
  );
};
