import { Button } from '@ui5/webcomponents-react';
import { useSetRecoilState } from 'recoil';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

import './SidebarSwitcher.scss';

export function SidebarSwitcher() {
  const setSidebarCondensed = useSetRecoilState(isSidebarCondensedState);

  return (
    <div className="sidebar-switcher-wrapper">
      <Button
        design="Transparent"
        icon="menu2"
        onClick={() => setSidebarCondensed(prevState => !prevState)}
        className="sidebar-switcher"
      />
    </div>
  );
}
