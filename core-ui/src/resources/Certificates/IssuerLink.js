import React from 'react';
import { Link } from 'fundamental-react';

import { goToIssuer } from './helpers';

export function IssuerLink({ issuerRef }) {
  if (!issuerRef) {
    return '-';
  } else if (issuerRef.cluster === 'target') {
    return <Link onClick={() => goToIssuer(issuerRef)}>{issuerRef.name}</Link>;
  } else {
    return issuerRef.name;
  }
}
