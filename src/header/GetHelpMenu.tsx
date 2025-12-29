import { Menu, MenuItem } from '@ui5/webcomponents-react';
import { MenuDomRef, Ui5CustomEvent } from '@ui5/webcomponents-react';
import { MenuItemClickEventDetail } from '@ui5/webcomponents/dist/Menu.js';

import { useGetHelpLinks } from './SidebarMenu/useGetHelpLinks';

interface GetHelpLink {
  label: string;
  link: string;
}

interface GetHelpMenuProps {
  isMenuOpen: boolean;
  onClose: () => void;
}

export function GetHelpMenu({
  isMenuOpen,
  onClose: handleClose,
}: GetHelpMenuProps) {
  const getHelpLinks = useGetHelpLinks();

  const openNewWindow = (link: string) => {
    const newWindow = window.open(link, '_blank', 'noopener, noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  const handleMenuItemClick = (
    e: Ui5CustomEvent<MenuDomRef, MenuItemClickEventDetail>,
  ) => {
    const getHelpLinkUsed = getHelpLinks.find((x) => x.label === e.detail.text);

    if (getHelpLinkUsed) {
      openNewWindow(getHelpLinkUsed.link);
    }
  };
  return (
    <Menu
      open={isMenuOpen}
      opener="openGetHelpMenu"
      onClose={handleClose}
      onItemClick={handleMenuItemClick}
    >
      {getHelpLinks.map((getHelpLint: GetHelpLink) => (
        <MenuItem
          key={getHelpLint.link}
          text={getHelpLint.label}
          icon="inspect"
        />
      ))}
    </Menu>
  );
}
