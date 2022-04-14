import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Labels } from 'shared/components/Labels/Labels';
import { Link } from 'shared/components/Link/Link';
import { Trans } from 'react-i18next';
import { SidecarsCreate } from '../Create/Sidecars/Sidecars.create';

export function SidecarsList(props) {
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
      {...props}
    />
  );
}
export default SidecarsList;
