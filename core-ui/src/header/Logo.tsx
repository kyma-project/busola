import { Button } from 'fundamental-react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';
import { themeState } from 'state/preferences/themeAtom';

import './Logo.scss';

export function Logo() {
  const theme = useRecoilValue(themeState);
  const setSidebarCondensed = useSetRecoilState(isSidebarCondensedState);

  return (
    <>
      <div className="nav__buton-wrapper">
        <Button
          onClick={() => setSidebarCondensed(prevState => !prevState)}
          glyph="menu2"
          option="transparent"
          className="sidebar-switcher"
        />
      </div>
      <img
        alt="Kyma"
        src={theme === 'hcw' ? '/assets/logo-black.svg' : '/assets/logo.svg'}
      />
    </>
  );
}
