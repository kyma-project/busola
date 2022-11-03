import { useGetTranslation } from 'components/Extensibility/helpers';
import { Link } from 'shared/components/Link/Link';
import { useGetBusolaVersionDetails } from './useGetBusolaVersion';
import { useGetLegalLinks } from './useGetLegalLinks';

import './Footer.scss';
import { useRecoilValue } from 'recoil';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

export function Footer() {
  const { t } = useGetTranslation();
  const { githubLink, busolaVersion } = useGetBusolaVersionDetails();
  const legalLinks = useGetLegalLinks();
  const isSidebarCondensed = useRecoilValue(isSidebarCondensedState);
  if (isSidebarCondensed) return null;

  return (
    <footer className="footer">
      <div className="footer__legal-links">
        {legalLinks.map(legalLink => (
          <Link
            url={legalLink.link}
            text={legalLink.label}
            className="fd-link"
          />
        ))}
      </div>
      <div>
        <p className="footer__kyma-version">{t('common.labels.version')}</p>
        <Link url={githubLink} text={busolaVersion} className="fd-link" />
      </div>
    </footer>
  );
}
