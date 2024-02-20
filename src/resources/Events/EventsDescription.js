import { Trans } from 'react-i18next';
import { Link as DescriptionLink } from 'shared/components/Link/Link';

export const description = (
  <Trans i18nKey="events.description">
    <DescriptionLink
      className="bsl-link"
      url="https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/"
    />
  </Trans>
);
