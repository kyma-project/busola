import { Button } from '@ui5/webcomponents-react';
import { useSetRecoilState } from 'recoil';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

import './SidebarSwitcher.scss';

export function SidebarSwitcher() {
  const setSidebarCondensed = useSetRecoilState(isSidebarCondensedState);

  return (
    <div className="sidebar-switcher-wrapper">
      <Button
        onClick={() => setSidebarCondensed(prevState => !prevState)}
        icon="menu2"
        design="Transparent"
        className="sidebar-switcher"
      />
    </div>
  );
}
