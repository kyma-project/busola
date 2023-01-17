import { Menu, Icon } from 'fundamental-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useUrl } from 'hooks/useUrl';
import { NamespacesState } from 'state/namespacesAtom';

import './NamespaceDropdown.scss';

export function NamespaceDropdown({
  namespaces,
  hideDropdown,
}: {
  namespaces: NamespacesState;
  hideDropdown: () => void;
}) {
  const { clusterUrl } = useUrl();
  const { t } = useTranslation();

  const namespacesOverviewNode = (
    <Menu.Item>
      <Link to={clusterUrl(`namespaces`)}>
        <Icon glyph="dimension" className="fd-margin-end--tiny" />
        {t('namespaces.namespaces-overview')}
      </Link>
    </Menu.Item>
  );

  const namespacesDropdownList =
    namespaces.map(n => (
      <Menu.Item>
        <Link to={clusterUrl(`namespaces/${n}`)}>{n}</Link>
      </Menu.Item>
    )) || [];

  return (
    <Menu>
      <Menu.List onClick={hideDropdown}>
        {namespacesOverviewNode}
        {namespacesDropdownList}
      </Menu.List>
    </Menu>
  );
}
