import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, EMPTY_TEXT_PLACEHOLDER, Labels } from 'react-shared';
import { Trans } from 'react-i18next';

export function SidecarsList({ DefaultRenderer, ...otherParams }) {
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
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
}
