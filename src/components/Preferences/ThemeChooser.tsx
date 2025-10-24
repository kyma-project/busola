import { useAtom } from 'jotai';
import {
  Theme,
  isSystemThemeDark,
  themeAtom,
} from 'state/preferences/themeAtom';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme';
import { TileButton } from 'shared/components/TileButton/TileButton';
import { ThemePreview } from './ThemePreview/ThemePreview';
import { useTranslation } from 'react-i18next';
import { useEventListener } from 'hooks/useEventListener';
import { RefObject, useState } from 'react';
import { TabContainerDomRef } from '@ui5/webcomponents-react';

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

const getThemeId = (theme: string) => {
  return availableThemesArray.find((item) => item.theme === theme)?.id;
};
const getThemeName = (id: number) => {
  return availableThemesArray.find((item) => item.id === id)?.theme;
};

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
  const [tabId, setTabId] = useState(() => getThemeId(theme) || 0);

  useEventListener(
    'keydown',
    (e) => {
      if (keyNavigationEnabled) {
        //@ts-ignore
        const { key } = e;
        if (key === 'ArrowDown' && tabId <= availableThemesArray.length - 2) {
          setTabId(tabId + 1);
          setUsedTheme(getThemeName(tabId + 1) || 'sap_horizon');
          console.log(tabsListRef?.current?.children[tabId].children[0]);
          //@ts-ignore
          tabsListRef?.current?.children[tabId + 1].children[0].focus();
        } else if (key === 'ArrowUp' && tabId >= 1) {
          setTabId(tabId - 1);
          setUsedTheme(getThemeName(tabId - 1) || 'sap_horizon');
          //@ts-ignore
          tabsListRef?.current?.children[tabId - 1].children[0].focus();
        }
      }
    },
    [tabId, keyNavigationEnabled],
  );

  return (
    <>
      {availableThemesArray.map(({ theme: themeName }) => {
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
                if (isSystemThemeDark()) setTheme('sap_horizon_dark');
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
