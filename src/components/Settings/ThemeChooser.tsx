import { useAtom } from 'jotai';
import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { List, ListDomRef } from '@ui5/webcomponents-react';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme';

import { Theme, isSystemThemeDark, themeAtom } from 'state/settings/themeAtom';
import { TileButton } from 'shared/components/TileButton/TileButton';

import { ThemePreview } from './ThemePreview/ThemePreview';
import './ThemeChooser.scss';

const AVAILABLE_THEMES: Theme[] = [
  'light_dark',
  'sap_horizon',
  'sap_horizon_dark',
  'sap_horizon_hcw',
  'sap_horizon_hcb',
];

interface ThemeChooserProps {
  listRef: RefObject<ListDomRef>;
}

export default function ThemeChooser({ listRef }: ThemeChooserProps) {
  const { t } = useTranslation();
  const [theme, setUsedTheme] = useAtom(themeAtom);

  return (
    <List ref={listRef}>
      {AVAILABLE_THEMES.map((themeName) => {
        return (
          <TileButton
            key={themeName}
            title={t(`settings.interface.themes.${themeName}.title`)}
            description={t(
              `settings.interface.themes.${themeName}.description`,
            )}
            icon={<ThemePreview theme={themeName} />}
            isActive={themeName === theme}
            onActivate={() => {
              setUsedTheme(themeName);
              if (theme === 'light_dark') {
                if (isSystemThemeDark()) setTheme('sap_horizon_dark');
                else setTheme('sap_horizon');
              } else {
                setTheme(theme);
              }
            }}
          />
        );
      })}
    </List>
  );
}
