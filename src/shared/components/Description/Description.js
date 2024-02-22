import { Trans } from 'react-i18next';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

export function Description({ i18nKey, url }) {
  return (
    <Trans i18nKey={i18nKey}>
      <ExternalLink url={url} />
    </Trans>
  );
}
