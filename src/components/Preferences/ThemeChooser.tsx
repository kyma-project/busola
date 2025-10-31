import { useAtom } from 'jotai';
import {
  Theme,
  isSystemThemeDark,
  themeAtom,
} from 'state/preferences/themeAtom';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme';
import { ThemePreview } from './ThemePreview/ThemePreview';
import { useTranslation } from 'react-i18next';
import { RefObject, useEffect } from 'react';
import {
  List,
  ListItemCustom,
  TabContainerDomRef,
  Text,
} from '@ui5/webcomponents-react';

import './ThemeChooser.scss';

const availableThemesArray: { theme: Theme; id: number }[] = [
  {
    theme: 'light_dark',
    id: 0,
  },
  {
    theme: 'sap_horizon',
    id: 1,
  },
  {
    theme: 'sap_horizon_dark',
    id: 2,
  },
  {
    theme: 'sap_horizon_hcw',
    id: 3,
  },
  {
    theme: 'sap_horizon_hcb',
    id: 4,
  },
];

interface ThemeChooserProps {
  keyNavigationEnabled: boolean;
  tabsListRef: RefObject<TabContainerDomRef>;
}

export default function ThemeChooser({
  keyNavigationEnabled,
  tabsListRef,
}: ThemeChooserProps) {
  const { t } = useTranslation();
  const [theme, setUsedTheme] = useAtom(themeAtom);

  useEffect(() => {
    if (keyNavigationEnabled) {
      //@ts-ignore
      tabsListRef?.current?.children[0].children[0].focus();
    }
  }, [keyNavigationEnabled, tabsListRef]);

  return (
    <List>
      {availableThemesArray.map(({ theme: themeName }) => {
        return (
          <ListItemCustom
            key={themeName}
            selected={themeName === theme}
            style={{ padding: '0' }}
            onClick={() => {
              setUsedTheme(themeName);
              if (theme === 'light_dark') {
                if (isSystemThemeDark()) setTheme('sap_horizon_dark');
                else setTheme('sap_horizon');
              } else {
                setTheme(theme);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                setUsedTheme(themeName);
                if (theme === 'light_dark') {
                  if (isSystemThemeDark()) setTheme('sap_horizon_dark');
                  else setTheme('sap_horizon');
                } else {
                  setTheme(theme);
                }
              }
            }}
          >
            <div className="theme-tile">
              <div className="icon-container">
                <ThemePreview theme={themeName} />
              </div>
              <div className="theme-tile__text">
                <Text>{t(`settings.interface.themes.${themeName}.title`)}</Text>
                <Text className="bsl-has-color-status-4">
                  {t(`settings.interface.themes.${themeName}.description`)}
                </Text>
              </div>
            </div>
          </ListItemCustom>
        );
      })}
    </List>
  );
}
