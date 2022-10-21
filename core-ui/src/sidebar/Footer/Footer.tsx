import { Link } from 'shared/components/Link/Link';
import { useGetBusolaVersionDetails } from './useGetBusolaVersion';
import { useGetLegalLinks } from './useGetLegalLinks';

export function Footer() {
  const { githubLink, busolaVersion } = useGetBusolaVersionDetails();
  const legalLinks = useGetLegalLinks();

  return (
    <footer>
      <div>
        {legalLinks.map(legalLink => (
          <Link url={legalLink.link} text={legalLink.label} className=""></Link>
        ))}
        <Link url={githubLink} text={busolaVersion} className="" />
      </div>
    </footer>
  );
}
