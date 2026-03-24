import { useUrl } from 'hooks/useUrl';
import { Link } from 'shared/components/Link/Link';

interface SubjectLinkProps {
  subject: any;
}

export function SubjectLink({ subject }: SubjectLinkProps) {
  const { namespaceUrl } = useUrl();

  const path = namespaceUrl(`serviceaccounts/${subject.name}`, {
    namespace: subject.namespace,
  });

  if (subject.kind === 'ServiceAccount') {
    return <Link url={path}>{subject.name}</Link>;
  } else {
    return subject.name;
  }
}
