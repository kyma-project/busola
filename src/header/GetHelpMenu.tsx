import {
  Menu,
  MenuDomRef,
  MenuItem,
  type ShellBarDomRef,
  Ui5CustomEvent,
} from '@ui5/webcomponents-react';
import { MenuItemClickEventDetail } from '@ui5/webcomponents/dist/Menu.js';

import { useGetHelpLinks } from './SidebarMenu/useGetHelpLinks';
import { type RefObject, useState } from 'react';
import { ShellBarAction } from 'header/ShellBarAction';
import { t } from 'i18next';
import { createPortal } from 'react-dom';
import { resolveOpener } from 'header/helpers';

interface GetHelpLink {
  label: string;
  link: string;
}

interface GetHelpMenuProps {
  shellbarRef: RefObject<ShellBarDomRef | null>;
}

export function GetHelpMenu({ shellbarRef }: GetHelpMenuProps) {
  const [isGetHelpOpen, setIsGetHelpOpen] = useState(false);
  const [opener, setOpener] = useState<HTMLElement | undefined>();
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
    <>
      <ShellBarAction
        onClick={() => {
          const resolvedOpener = resolveOpener('openGetHelpMenu', shellbarRef);
          setOpener(resolvedOpener);
          setIsGetHelpOpen(true);
        }}
        id="openGetHelpMenu"
        icon="sys-help"
        text={t('navigation.menu.get-help')}
        title={t('navigation.menu.get-help')}
      />
      {createPortal(
        <Menu
          open={isGetHelpOpen}
          opener={opener}
          onClose={() => setIsGetHelpOpen(false)}
          onItemClick={handleMenuItemClick}
        >
          {getHelpLinks.map((getHelpLint: GetHelpLink) => (
            <MenuItem
              key={getHelpLint.link}
              text={getHelpLint.label}
              icon="inspect"
            />
          ))}
        </Menu>,
        document.body,
      )}
    </>
  );
}
