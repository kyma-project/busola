import { ShellBarItem } from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';
import { configFeaturesNames } from 'state/types';
import './SnowFeature.scss';

const SNOW_STORAGE_KEY = 'snow-animation';

export function SnowFeature() {
  const { t } = useTranslation();
  const snowStorage = localStorage.getItem(SNOW_STORAGE_KEY);
  const localStorageSnowEnabled = () => {
    if (snowStorage && typeof JSON.parse(snowStorage) === 'boolean') {
      return JSON.parse(snowStorage);
    }
    return true;
  };
  const [isSnowOpen, setIsSnowOpen] = useState(localStorageSnowEnabled());
  const { isEnabled: isSnowEnabled } = useFeature(configFeaturesNames.SNOW);
  const [theme] = useRecoilState(themeState);

  useEffect(() => {
    if (theme === 'sap_horizon_hcb' || theme === 'sap_horizon_hcw') {
      setIsSnowOpen(false);
      localStorage.setItem(SNOW_STORAGE_KEY, JSON.stringify(false));
    }
  }, [theme]);
  const handleSnowButtonClick = () => {
    if (isSnowOpen) {
      setIsSnowOpen(false);
      localStorage.setItem(SNOW_STORAGE_KEY, JSON.stringify(false));
    } else {
      setIsSnowOpen(true);
      localStorage.setItem(SNOW_STORAGE_KEY, JSON.stringify(true));
    }
  };

  return (
    <>
      {isSnowOpen &&
        isSnowEnabled &&
        createPortal(
          <div className="snowflakes" aria-hidden="true">
            {[...Array(10).keys()].map(key => (
              <div key={`snowflake-${key}`} className="snowflake">
                ❅
              </div>
            ))}
          </div>,
          document.body,
        )}
      {isSnowEnabled && (
        <ShellBarItem
          onClick={handleSnowButtonClick}
          icon={isSnowOpen ? 'heating-cooling' : 'activate'}
          text={isSnowOpen ? t('navigation.snow-stop') : t('navigation.snow')}
          title={isSnowOpen ? t('navigation.snow-stop') : t('navigation.snow')}
        />
      )}
    </>
  );
}
