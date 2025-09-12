import { useUrl } from 'hooks/useUrl';
import { Link } from 'shared/components/Link/Link';

export function SubjectLink({ subject }) {
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
