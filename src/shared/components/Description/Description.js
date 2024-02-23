import { Trans } from 'react-i18next';
import { Link } from 'shared/components/Link/Link';

export function Description({ i18nKey, url }) {
  return (
    <Trans i18nKey={i18nKey}>
      <Link className="bsl-link" url={url} />
    </Trans>
  );
}
