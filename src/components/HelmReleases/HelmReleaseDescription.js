import { Trans } from 'react-i18next';
import { Link as ExternalLink } from '../../shared/components/Link/Link';
import React from 'react';

export const description = (
  <Trans i18nKey={'helm-releases.description'}>
    <ExternalLink
      className="bsl-link"
      url="https://helm.sh/docs/glossary/#release"
    />
  </Trans>
);
