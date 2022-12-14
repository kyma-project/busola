import React from 'react';
import { Link } from 'react-router-dom';
import { useUrl } from 'hooks/useUrl';

export function IssuerLink({ issuerRef }) {
  const { namespaceUrl } = useUrl();

  if (!issuerRef) {
    return '-';
  } else if (issuerRef.cluster === 'target') {
    return (
      <Link
        className="fd-link"
        to={namespaceUrl(`issuers/${issuerRef.name}`, {
          namespace: issuerRef.namespace,
        })}
      >
        {issuerRef.name}
      </Link>
    );
  } else {
    return issuerRef.name;
  }
}
