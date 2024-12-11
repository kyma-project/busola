import { useRecoilValue } from 'recoil';
import { isSystemThemeDark, themeState } from 'state/preferences/themeAtom';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme';

// you must initially load the themeState to
//let the App know what theme to choose
export const useInitTheme = () => {
  const theme = useRecoilValue(themeState);
  if (theme === 'light_dark' || theme === 'snow_fall_dark') {
    if (isSystemThemeDark()) setTheme('sap_horizon_dark');
    else setTheme('sap_horizon');
  } else {
    setTheme(theme);
  }
};
