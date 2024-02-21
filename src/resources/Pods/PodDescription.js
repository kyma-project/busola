import { Trans } from 'react-i18next';
import { Link as ReactSharedLink } from 'shared/components/Link/Link';
import React from 'react';

export const description = (
  <Trans i18nKey="pods.description">
    <ReactSharedLink
      className="bsl-link"
      url="https://kubernetes.io/docs/concepts/workloads/pods/"
    />
  </Trans>
);
