import { Trans } from 'react-i18next';
import { Link as DescLink } from 'shared/components/Link/Link';
import React from 'react';

export const description = (
  <Trans i18nKey="pv.description">
    <DescLink
      className="bsl-link"
      url="https://kubernetes.io/docs/concepts/storage/persistent-volumes"
    />
  </Trans>
);
