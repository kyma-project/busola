import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';

// we have to initially load the themeState to
//let the App know what theme to choose
export const useInitTheme = () => {
  useRecoilValue(themeState);
};
