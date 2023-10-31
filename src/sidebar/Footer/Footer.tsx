import { useGetTranslation } from 'components/Extensibility/helpers';
import { useRecoilValue } from 'recoil';
import { Link } from 'shared/components/Link/Link';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';
import { useGetBusolaVersionDetails } from './useGetBusolaVersion';
import { useGetLegalLinks } from './useGetLegalLinks';

import './Footer.scss';

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
            key={legalLink.link}
            url={legalLink.link}
            text={legalLink.label}
            className="bsl-link"
          />
        ))}
      </div>
      <div className="bsl-margin-top--sm">
        <p className="footer__kyma-version">{t('common.labels.version')}</p>
        <Link
          dataTestId="version-link"
          url={githubLink}
          text={busolaVersion}
          className="bsl-link"
        />
      </div>
    </footer>
  );
}
