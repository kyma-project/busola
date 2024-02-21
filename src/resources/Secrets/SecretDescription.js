import { Trans } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';
import React from 'react';

export const description = (
  <Trans i18nKey="secrets.description">
    <Link
      className="bsl-link"
      url="https://kubernetes.io/docs/concepts/configuration/secret/"
    />
  </Trans>
);
