import { useState } from 'react';
import './CommandPaletteUI.scss';
import { K8sResource } from 'types';
import { Icon, Input } from '@ui5/webcomponents-react';
import { useObjectState } from 'shared/useObjectState';
import { CommandPaletteUI } from './CommandPaletteUI';
import { createPortal } from 'react-dom';
import './CommandPaletteSearchBar.scss';

export function CommandPaletteSearchBar({ slot }: { slot?: string }) {
  const [open, setOpen] = useState(false);
  const hide = () => setShowDialog(false);
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
        accessibleName="command-palette-search-bar"
        onClick={(e: any) => setOpen(true)}
        showClearIcon
        className="search-with-display-more command-palette-search-bar"
        icon={<Icon name="slim-arrow-right" />}
        slot={slot}
        placeholder="Quick navigation"
      />
      {open &&
        createPortal(
          <CommandPaletteUI
            showCommandPalette={open}
            hide={hide}
            resourceCache={resourceCache}
            updateResourceCache={updateResourceCache}
          />,
          document.body,
        )}
    </>
  );
}
