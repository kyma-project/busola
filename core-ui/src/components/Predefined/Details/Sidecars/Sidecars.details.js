import React from 'react';
import { useTranslation } from 'react-i18next';

import { EMPTY_TEXT_PLACEHOLDER, ResourceDetails } from 'react-shared';
import { Selector } from 'shared/components/Selector/Selector';
import { IstioListeners } from './IstioListeners';

import { SidecarsCreate } from '../../Create/Sidecars/Sidecars.create';

export const SidecarsDetails = props => {
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
      selector={sidecar.spec?.workloadSelector}
      labels={sidecar.spec?.workloadSelector?.labels}
      title={t('workload-selector.title')}
      namespace={sidecar.metadata.namespace}
      isIstioSelector
    />
  );

  return (
    <ResourceDetails
      customComponents={[IstioListeners, WorkloadSelector]}
      customColumns={customColumns}
      singularName={t('persistent-volume-claims.name_singular')}
      createResourceForm={SidecarsCreate}
      {...props}
    />
  );
};

export default SidecarsDetails;
