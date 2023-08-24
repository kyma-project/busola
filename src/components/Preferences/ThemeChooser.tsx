import React from 'react';
import { useRecoilState } from 'recoil';
import { Theme, themeState } from 'state/preferences/themeAtom';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme';
import { TileButton } from 'shared/components/TileButton/TileButton';
import { ThemePreview } from './ThemePreview/ThemePreview';
import { useTranslation } from 'react-i18next';

const AVAILABLE_THEMES: Theme[] = [
  'light_dark',
  'sap_horizon',
  'sap_horizon_dark',
  'sap_horizon_hcw',
  'sap_horizon_hcb',
];

export default function ThemeChooser() {
  const { t } = useTranslation();
  const [theme, setUsedTheme] = useRecoilState(themeState);

  const getCurrentTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <>
      {AVAILABLE_THEMES.map(themeName => {
        return (
          <TileButton
            key={themeName}
            title={t(`settings.interface.themes.${themeName}.title`)}
            description={t(
              `settings.interface.themes.${themeName}.description`,
            )}
            icon={<ThemePreview theme={themeName} />}
            isActive={themeName === theme}
            handleClick={() => {
              setUsedTheme(themeName);
              if (theme === 'light_dark') {
                if (getCurrentTheme()) setTheme('sap_horizon_dark');
                else setTheme('sap_horizon');
              } else {
                setTheme(theme);
              }
            }}
          />
        );
      })}
    </>
  );
}
