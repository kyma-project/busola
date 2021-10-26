import React from 'react';
import LuigiClient from '@luigi-project/client';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { Link } from 'fundamental-react';

export function RoleRef({ roleRef }) {
  if (!roleRef) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  const navigateToRoleDetails = () => {
    if (roleRef.kind === 'ClusterRole') {
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(`/clusterroles/details/${roleRef.name}`);
    } else {
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/roles/details/${roleRef.name}`);
    }
  };

  return (
    <Link className="fd-link" onClick={() => navigateToRoleDetails()}>
      {roleRef.kind + ' ' + roleRef.name}
    </Link>
  );
}
