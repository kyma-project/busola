import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledByKind, Labels } from 'react-shared';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

import { DaemonSetStatus } from '../Details/DaemonSet/DaemonSetStatus';

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
      header: t('common.headers.pods'),
      value: resource => <DaemonSetStatus daemonSet={resource} />,
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
