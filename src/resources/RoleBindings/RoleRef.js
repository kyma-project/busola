import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { useUrl } from 'hooks/useUrl';
import { Link } from 'shared/components/Link/Link';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { useTranslation } from 'react-i18next';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

const shortRoleKind = resource => {
  return resource.roleRef === 'ClusterRole' ? '(CR)' : '(R)';
};

export function RoleRef({ roleRef }) {
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
    <UI5Panel title={t('common.headers.configuration')}>
      <LayoutPanelRow
        name={t('role-bindings.headers.role-ref')}
        value={
          <>
            <Link url={roleDetailsLink()}>{roleRef.name}</Link>
            <Tooltip delay={0} content={roleRef.kind}>
              {shortRoleKind(roleRef.kind)}
            </Tooltip>
          </>
        }
      />
    </UI5Panel>
  );
}
