import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useUrl } from 'hooks/useUrl';
import { Link } from 'shared/components/Link/Link';
import { useTranslation } from 'react-i18next';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';

const shortRoleKind = (resource: any) => {
  return resource.roleRef === 'ClusterRole' ? '(CR)' : '(R)';
};

interface RoleRefProps {
  roleRef: any;
}

export function RoleRef({ roleRef }: RoleRefProps) {
  const { t } = useTranslation();
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
    <UI5Card
      keyComponent="role-binding"
      key="role-binding"
      title={t('common.headers.configuration')}
      accessibleName={t('common.accessible-name.configuration')}
    >
      <LayoutPanelRow
        name={t('role-bindings.headers.role-ref')}
        value={
          <>
            <Link url={roleDetailsLink()}>{roleRef.name}</Link>{' '}
            <span title={roleRef.kind}>{shortRoleKind(roleRef.kind)}</span>
          </>
        }
      />
    </UI5Card>
  );
}
