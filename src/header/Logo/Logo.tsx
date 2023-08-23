import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';

import './Logo.scss';

export function Logo() {
  const theme = useRecoilValue(themeState);

  return (
    <img
      alt="Kyma"
      src={
        theme === 'sap_horizon_hcw' || theme === 'sap_horizon'
          ? '/assets/logo-black.svg'
          : '/assets/logo.svg'
      }
    />
  );
}
