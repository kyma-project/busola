import { Menu, Icon } from 'fundamental-react';
import { Link } from 'react-router-dom';

import { useUrl } from 'hooks/useUrl';
import { NamespacesState } from 'state/namespacesAtom';

import './NamespaceDropdown.scss';

export function NamespaceDropdown({
  namespaces,
}: {
  namespaces: NamespacesState;
}) {
  const { clusterUrl } = useUrl();

  const namespacesOverviewNode = (
    <Menu.Item>
      <Link to={clusterUrl(`namespaces`)}>
        <Icon glyph="dimension" /> Namespaces Overview
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
      <Menu.List>
        {namespacesOverviewNode}
        {namespacesDropdownList}
      </Menu.List>
    </Menu>
  );
}
