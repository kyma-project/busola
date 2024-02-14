import { Trans } from 'react-i18next';
import { Link } from '../../shared/components/Link/Link';
import React from 'react';

export const descriptionKey = 'roles.description';

export const description = (
  <Trans i18nKey={descriptionKey}>
    <Link
      className="bsl-link"
      url="https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#user-authorization"
    />
  </Trans>
);
