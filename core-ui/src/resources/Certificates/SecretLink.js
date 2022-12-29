import React from 'react';
import { Link } from 'react-router-dom';
import { useUrl } from 'hooks/useUrl';

export function SecretLink({ secretRef }) {
  const { namespaceUrl } = useUrl();

  if (!secretRef) {
    return '-';
  } else {
    return (
      <Link
        className="fd-link"
        to={namespaceUrl(`secrets/${secretRef.name}`, {
          namespace: secretRef.namespace,
        })}
      >
        {secretRef.name}
      </Link>
    );
  }
}
