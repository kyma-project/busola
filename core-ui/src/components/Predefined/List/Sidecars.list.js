import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Link,
  EMPTY_TEXT_PLACEHOLDER,
  Labels,
  ResourcesList,
} from 'react-shared';
import { Trans } from 'react-i18next';
import { usePrepareListProps } from 'routing/common';
import { SidecarsCreate } from '../Create/Sidecars/Sidecars.create';

export function SidecarsList() {
  const params = usePrepareListProps('Sidecars');
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('sidecars.headers.outbound-traffic-policy'),
      value: sidecar =>
        sidecar.spec?.outboundTrafficPolicy?.mode || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('sidecars.headers.workload-selector-labels'),
      value: sidecar => (
        <Labels labels={sidecar.spec?.workloadSelector?.labels} />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="sidecars.description">
      <Link
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/networking/sidecar/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={SidecarsCreate}
      {...params}
    />
  );
}
export default SidecarsList;
