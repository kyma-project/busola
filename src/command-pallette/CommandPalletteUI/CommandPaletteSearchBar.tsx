import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Icon, Input, InputDomRef } from '@ui5/webcomponents-react';
import { K8sResource } from 'types';
import { useObjectState } from 'shared/useObjectState';
import { CommandPaletteUI } from './CommandPaletteUI';
import './CommandPaletteSearchBar.scss';

export function CommandPaletteSearchBar({ slot }: { slot?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [resourceCache, updateResourceCache] = useObjectState<
    Record<string, K8sResource[]>
  >();

  const setShowDialog = (value: boolean) => {
    const modalPresent = document.querySelector('ui5-dialog[open]');
    // disable opening palette if other modal is present
    if (!modalPresent || !value) {
      setOpen(value);
    }
  };

  return (
    <>
      <Input
        id="command-palette-search-bar"
        accessibleName="command-palette-search-bar"
        onClick={() => setOpen(true)}
        onInput={e => e.preventDefault()}
        showClearIcon
        className="search-with-display-more command-palette-search-bar"
        icon={<Icon name="slim-arrow-right" />}
        slot={slot}
        placeholder={t('command-palette.search.quick-navigation')}
      />
      {open &&
        createPortal(
          <CommandPaletteUI
            showCommandPalette={open}
            hide={() => setShowDialog(false)}
            resourceCache={resourceCache}
            updateResourceCache={updateResourceCache}
          />,
          document.body,
        )}
    </>
  );
}
