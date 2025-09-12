import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { isSidebarCondensedAtom } from 'state/preferences/isSidebarCondensedAtom';

export function SidebarSwitcher(props: any) {
  const { t } = useTranslation();
  const [isSidebarCondensed, setSidebarCondensed] = useAtom(
    isSidebarCondensedAtom,
  );

  return (
    <Button
      slot={props.slot}
      onClick={() => setSidebarCondensed((prevState) => !prevState)}
      icon="menu2"
      design="Transparent"
      accessibleName="collapse-sidebar"
      tooltip={
        isSidebarCondensed
          ? t('common.tooltips.expand-navigation')
          : t('common.tooltips.collapse-navigation')
      }
    />
  );
}
