import { Link } from 'shared/components/Link/Link';
import { useGetBusolaVersionDetails } from './useGetBusolaVersion';

export function Footer() {
  const { githubLink, busolaVersion } = useGetBusolaVersionDetails();
  return (
    <footer>
      <div>
        <Link url={githubLink} text={busolaVersion} className="" />
      </div>
    </footer>
  );
}
