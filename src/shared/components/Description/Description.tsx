import { Trans } from 'react-i18next';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

interface DescriptionProps {
  i18nKey: string;
  url: string;
}

export function Description({ i18nKey, url }: DescriptionProps) {
  return (
    <Trans i18nKey={i18nKey}>
      <ExternalLink url={url} />
    </Trans>
  );
}
