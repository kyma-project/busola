import React from 'react';
import { goToIssuer } from './helpers';
import { Link } from 'fundamental-react';

export function IssuerLink({ issuerRef }) {
  if (issuerRef.cluster === 'target') {
    return <Link onClick={() => goToIssuer(issuerRef)}>{issuerRef.name}</Link>;
  } else {
    return issuerRef.name;
  }
}
