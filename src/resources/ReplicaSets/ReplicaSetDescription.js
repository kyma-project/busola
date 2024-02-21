import { Trans } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';
import React from 'react';

export const description = (
  <Trans i18nKey="replica-sets.description">
    <Link
      className="bsl-link"
      url="https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/"
    />
  </Trans>
);
