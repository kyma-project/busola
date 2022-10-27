import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { TileButton } from 'shared/components/TileButton/TileButton';
import { themeState } from 'state/preferences/themeAtom';
import { ThemePreview } from './ThemePreview/ThemePreview';

const AVAILABLE_THEMES = ['light_dark', 'light', 'dark', 'hcw', 'hcb'];

export default function ThemeChooser() {
  const { t } = useTranslation();
  const [theme, setTheme] = useRecoilState(themeState);

  return (
    <ul>
      {AVAILABLE_THEMES.map(themeName => (
        <TileButton
          key={themeName}
          id={themeName}
          title={t(`settings.interface.themes.${themeName}.title`)}
          description={t(`settings.interface.themes.${themeName}.description`)}
          icon={<ThemePreview theme={themeName} />}
          isActive={themeName === theme}
          handleClick={() => setTheme(themeName)}
        />
      ))}
    </ul>
  );
}
