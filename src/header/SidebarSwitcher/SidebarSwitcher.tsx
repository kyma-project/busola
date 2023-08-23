import { Button } from 'fundamental-react';
import { useSetRecoilState } from 'recoil';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

import './SidebarSwitcher.scss';

export function SidebarSwitcher(props: any) {
  const setSidebarCondensed = useSetRecoilState(isSidebarCondensedState);

  return (
    <div slot={props.slot} className="sidebar-switcher-wrapper">
      <Button
        onClick={() => setSidebarCondensed(prevState => !prevState)}
        glyph="menu2"
        option="transparent"
        className="sidebar-switcher"
      />
    </div>
  );
}
