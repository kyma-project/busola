import { Trans } from 'react-i18next';
import { Link } from '../../shared/components/Link/Link';

export const description = (
  <Trans i18nKey="daemon-sets.description">
    <Link
      className="bsl-link"
      url="https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/"
    />
  </Trans>
);
