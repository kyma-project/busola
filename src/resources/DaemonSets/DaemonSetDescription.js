import { Trans } from 'react-i18next';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

export const description = (
  <Trans i18nKey="daemon-sets.description">
    <ExternalLink
      className="bsl-link"
      url="https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/"
    />
  </Trans>
);
