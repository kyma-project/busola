import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';

// we have to initially load the themeState to
//let know the App what theme to choose
export const useInitTheme = () => {
  useRecoilValue(themeState);
};
