import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme';

// you must initially load the themeState to
//let the App know what theme to choose
export const useInitTheme = () => {
  const theme = useRecoilValue(themeState);
  setTheme(theme);
  void useRecoilValue(themeState);
};
