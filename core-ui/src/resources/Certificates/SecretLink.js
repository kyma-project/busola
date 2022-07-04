import React from 'react';
import { Link } from 'fundamental-react';

import { goToSecret } from './helpers';

export function SecretLink({ secretRef }) {
  if (!secretRef) {
    return '-';
  } else {
    return <Link onClick={() => goToSecret(secretRef)}>{secretRef.name}</Link>;
  }
}
