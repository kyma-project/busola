import LuigiClient from '@luigi-project/client';
import { Menu, Icon } from 'fundamental-react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { NamespacesState } from 'state/namespacesAtom';

export function NamespaceDropdown({
  namespaces,
}: {
  namespaces: NamespacesState;
}) {
  const activeCluster = useRecoilValue(activeClusterNameState);
  const setActiveNamespace = useSetRecoilState(activeNamespaceIdState);

  const namespacesOverviewNode = (
    <Menu.Item
      url="#"
      onClick={() => {
        setActiveNamespace('');
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate('namespaces/');
      }}
    >
      <Icon glyph="dimension" /> Namespaces Overview
    </Menu.Item>
  );

  const namespacesDropdownList =
    namespaces?.[activeCluster]?.map(n => (
      <Menu.Item
        url="#"
        onClick={() => {
          setActiveNamespace(n);
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate('namespaces/' + n);
        }}
      >
        {n}
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
