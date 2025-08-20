import { Menu, MenuItem } from '@ui5/webcomponents-react';
import { MenuDomRef, Ui5CustomEvent } from '@ui5/webcomponents-react';
import { MenuItemClickEventDetail } from '@ui5/webcomponents/dist/Menu.js';
import { useSetAtom } from 'jotai';
import { isPreferencesOpenAtom } from 'state/preferences/isPreferencesModalOpenAtom';
import { useGetBusolaVersionDetails } from './SidebarMenu/useGetBusolaVersion';
import { useGetLegalLinks } from './SidebarMenu/useGetLegalLinks';
import { useGetHelpLinks } from './SidebarMenu/useGetHelpLinks';
import { useTranslation } from 'react-i18next';

interface LegalLink {
  label: string;
  link: string;
}

interface GetHelpLink {
  label: string;
  link: string;
}

interface HeaderMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
}

export function HeaderMenu({ isMenuOpen, setIsMenuOpen }: HeaderMenuProps) {
  const { t } = useTranslation();
  const setPreferencesOpen = useSetAtom(isPreferencesOpenAtom);
  const { githubLink, busolaVersion } = useGetBusolaVersionDetails();
  const legalLinks = useGetLegalLinks();
  const getHelpLinks = useGetHelpLinks();

  const nonBreakableSpaces = (number: number): string => {
    let spaces = '';
    for (let i = 0; i < number; i++) {
      spaces += '\u00a0';
    }
    return spaces;
  };

  const openNewWindow = (link: string) => {
    const newWindow = window.open(link, '_blank', 'noopener, noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  const handleMenuItemClick = (
    e: Ui5CustomEvent<MenuDomRef, MenuItemClickEventDetail>,
  ) => {
    const legalLinkUsed = legalLinks.find(x => x.label === e.detail.text);
    const getHelpLinkUsed = getHelpLinks.find(x => x.label === e.detail.text);

    if (e.detail.text === t('navigation.preferences.title')) {
      setPreferencesOpen(true);
    } else if (legalLinkUsed) {
      openNewWindow(legalLinkUsed.link);
    } else if (
      e.detail.text === `${t('common.labels.version')} ${busolaVersion}`
    ) {
      openNewWindow(githubLink);
    } else if (getHelpLinkUsed) {
      openNewWindow(getHelpLinkUsed.link);
    }
  };
  return (
    <Menu
      open={isMenuOpen}
      opener="openShellbarMenu"
      onClose={() => {
        setIsMenuOpen(false);
      }}
      onItemClick={handleMenuItemClick}
    >
      <MenuItem
        onClick={() => setPreferencesOpen(true)}
        key="preferences"
        text={t('navigation.preferences.title')}
        icon="wrench"
      />
      <MenuItem
        key="get-help"
        text={t('navigation.menu.get-help')}
        icon="sys-help"
      >
        {getHelpLinks.map((getHelpLint: GetHelpLink) => (
          <MenuItem
            key={getHelpLint.link}
            text={getHelpLint.label}
            icon="inspect"
          />
        ))}
      </MenuItem>
      <MenuItem
        key="legal-information"
        text={t('navigation.menu.legal-information') + nonBreakableSpaces(6)}
        icon="official-service"
      >
        {legalLinks.map((legalLink: LegalLink) => (
          <MenuItem
            key={legalLink.link}
            text={legalLink.label}
            icon="inspect"
          />
        ))}
        <MenuItem
          onClick={() => {
            window.open(githubLink, '_blank', 'noopener, noreferrer');
          }}
          text={t('common.labels.version')}
          additionalText={busolaVersion}
          icon="inspect"
        />
      </MenuItem>
    </Menu>
  );
}
