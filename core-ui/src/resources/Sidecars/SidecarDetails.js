import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Selector } from 'shared/components/Selector/Selector';

import { IstioListeners } from './IstioListeners';
import { SidecarCreate } from './SidecarCreate';

export function SidecarDetails(props) {
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
      createResourceForm={SidecarCreate}
      {...props}
    />
  );
}

export default SidecarDetails;
