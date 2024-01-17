import { Button } from '@ui5/webcomponents-react';
import { useSetRecoilState } from 'recoil';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

export function SidebarSwitcher(props: any) {
  const setSidebarCondensed = useSetRecoilState(isSidebarCondensedState);

  return (
    <Button
      slot={props.slot}
      onClick={() => setSidebarCondensed(prevState => !prevState)}
      icon="menu2"
      design="Transparent"
      accessibleName="collapse-sidebar"
    />
  );
}
