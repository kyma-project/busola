import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';

// you must initially load the themeState to
//let the App know what theme to choose
export const useInitTheme = () => {
  void useRecoilValue(themeState);
};
