import Snowfall from 'react-snowfall';
import { useRecoilState } from 'recoil';
import { themeState } from '../../../state/preferences/themeAtom';
import { useFeature } from '../../../hooks/useFeature';

function Snow() {
  const [theme] = useRecoilState(themeState);
  const feature = useFeature('SNOW') || {};

  if (!feature.isEnabled) {
    return null;
  }

  let snowColor = '#0060df';
  switch (theme) {
    case 'sap_horizon_dark':
    case 'sap_horizon_hcb':
      snowColor = 'white';
      break;
    case 'light_dark':
      if (isSystemThemeDark()) {
        snowColor = 'white';
      }
      break;
  }

  return <Snowfall color={snowColor} />;
}

const isSystemThemeDark = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export default Snow;
