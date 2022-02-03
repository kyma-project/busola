import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme, TileButton } from 'react-shared';
import { ThemePreview } from './ThemePreview/ThemePreview';

const themes = ['light_dark', 'light', 'dark', 'hcw', 'hcb', 'horizon'];

export default function ThemeChooser() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <ul>
      {themes.map(themeName => (
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
