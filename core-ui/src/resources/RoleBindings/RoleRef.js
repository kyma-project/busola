import React from 'react';
import LuigiClient from '@luigi-project/client';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Link } from 'fundamental-react';

const shortRoleKind = roleRefKind => {
  return roleRefKind === 'ClusterRole' ? '(CR)' : '(R)';
};

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
    <div>
      <Link className="fd-link" onClick={() => navigateToRoleDetails()}>
        {roleRef.name}
      </Link>
      <Tooltip delay={0} content={roleRef.kind}>
        {' '}
        {shortRoleKind(roleRef.kind)}
      </Tooltip>
    </div>
  );
}
