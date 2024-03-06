import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { useUrl } from 'hooks/useUrl';
import { Link } from 'shared/components/Link/Link';

const shortRoleKind = roleRefKind => {
  return roleRefKind === 'ClusterRole' ? '(CR)' : '(R)';
};

export function RoleRef({ roleRef }) {
  const { clusterUrl, namespaceUrl } = useUrl();
  if (!roleRef) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  const roleDetailsLink = () => {
    if (roleRef.kind === 'ClusterRole')
      return clusterUrl(`clusterroles/${roleRef.name}`);

    return namespaceUrl(`roles/${roleRef.name}`);
  };

  return (
    <div>
      <Link url={roleDetailsLink()}>{roleRef.name}</Link>
      <Tooltip delay={0} content={roleRef.kind}>
        {shortRoleKind(roleRef.kind)}
      </Tooltip>
    </div>
  );
}
