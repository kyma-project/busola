import React from 'react';
import { Link } from 'react-router-dom';
import { useUrl } from 'hooks/useUrl';
export function SubjectLink({ subject }) {
  const { namespaceUrl } = useUrl();

  const path = namespaceUrl(`serviceaccounts/${subject.name}`, {
    namespace: subject.namespace,
  });

  if (subject.kind === 'ServiceAccount') {
    return (
      <Link className="fd-link" to={path}>
        {subject.name}
      </Link>
    );
  } else {
    return subject.name;
  }
}
