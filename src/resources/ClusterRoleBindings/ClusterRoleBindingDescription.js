import { Trans } from 'react-i18next';
import { Link as ReactSharedLink } from 'shared/components/Link/Link';
import React from 'react';

export const descriptionKey = 'cluster-role-bindings.description';

export const description = (
  <Trans i18nKey={descriptionKey}>
    <ReactSharedLink
      className="bsl-link"
      url="https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#role-binding"
    />
  </Trans>
);
