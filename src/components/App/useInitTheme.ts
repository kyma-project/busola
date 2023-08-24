import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme';

// you must initially load the themeState to
//let the App know what theme to choose
export const useInitTheme = () => {
  const isSystemThemeDark = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = useRecoilValue(themeState);
  if (theme === 'light_dark') {
    if (isSystemThemeDark()) setTheme('sap_horizon_dark');
    else setTheme('sap_horizon');
  } else {
    setTheme(theme);
  }
};
