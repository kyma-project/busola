import { useGetTranslation } from 'components/Extensibility/helpers';
import { Link } from 'shared/components/Link/Link';
import { useGetBusolaVersionDetails } from './useGetBusolaVersion';
import { useGetLegalLinks } from './useGetLegalLinks';

export function Footer() {
  const { t } = useGetTranslation();
  const { githubLink, busolaVersion } = useGetBusolaVersionDetails();
  const legalLinks = useGetLegalLinks();

  return (
    <footer>
      {legalLinks.map(legalLink => (
        <Link url={legalLink.link} text={legalLink.label} />
      ))}
      <p>{t('common.labels.version')}</p>
      <Link url={githubLink} text={busolaVersion} />
    </footer>
  );
}
