import React from 'react';
import { useTranslation } from 'react-i18next';

import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { WorkloadSelector } from 'shared/components/WorkloadSelector/WorkloadSelector';
import { IstioListeners } from './IstioListeners';

export const SidecarsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('sidecars.headers.outbound-traffic-policy'),
      value: sidecar =>
        sidecar.spec?.outboundTrafficPolicy?.mode || EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  const WorkloadSelectorLabels = sidecar => (
    <WorkloadSelector
      resource={sidecar}
      labels={sidecar.spec?.workloadSelector?.labels}
      title={t('workload-selector.title')}
    />
  );

  return (
    <DefaultRenderer
      customComponents={[IstioListeners, WorkloadSelectorLabels]}
      customColumns={customColumns}
      singularName={t('persistent-volume-claims.name_singular')}
      {...otherParams}
    />
  );
};
