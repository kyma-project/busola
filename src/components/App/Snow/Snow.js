import Snowfall from 'react-snowfall';
import { useRecoilState } from 'recoil';
import { themeState } from '../../../state/preferences/themeAtom';
import { useFeature } from '../../../hooks/useFeature';

const WHITE_SNOW = 'white';
const LIGHT_BLUE_SNOW = '#4db1ff';

function Snow() {
  const [theme] = useRecoilState(themeState);
  const feature = useFeature('SNOW') || {};

  if (!feature.isEnabled) {
    return null;
  }

  let snowColor = LIGHT_BLUE_SNOW;
  switch (theme) {
    case 'sap_horizon_dark':
    case 'sap_horizon_hcb':
      snowColor = WHITE_SNOW;
      break;
    case 'sap_horizon':
    case 'sap_horizon_hcw': {
      break;
    }
    default: {
      if (isSystemThemeDark()) {
        snowColor = WHITE_SNOW;
      }
      break;
    }
  }

  return <Snowfall color={snowColor} />;
}

const isSystemThemeDark = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export default Snow;
