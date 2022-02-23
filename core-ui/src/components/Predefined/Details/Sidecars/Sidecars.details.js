import React from 'react';
import { useTranslation } from 'react-i18next';

import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { Selector } from 'shared/components/Selector/Selector';
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

  const WorkloadSelector = sidecar => (
    <Selector
      resource={sidecar}
      labels={sidecar.spec?.workloadSelector?.labels}
      title={t('workload-selector.title')}
    />
  );

  return (
    <DefaultRenderer
      customComponents={[IstioListeners, WorkloadSelector]}
      customColumns={customColumns}
      singularName={t('persistent-volume-claims.name_singular')}
      {...otherParams}
    />
  );
};
