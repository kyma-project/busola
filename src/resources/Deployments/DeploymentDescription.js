import { Trans } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';

export const description = (
  <Trans i18nKey="deployments.description">
    <Link
      className="bsl-link"
      url="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"
    />
  </Trans>
);
