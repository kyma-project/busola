import { Trans } from 'react-i18next';
import { Link } from '../../shared/components/Link/Link';
import React from 'react';

export const description = (
  <Trans i18nKey="network-policies.description">
    <Link
      className="bsl-link"
      url="https://kubernetes.io/docs/concepts/services-networking/network-policies/"
    />
  </Trans>
);
