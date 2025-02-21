import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Icon, Input } from '@ui5/webcomponents-react';
import { K8sResource } from 'types';
import { useObjectState } from 'shared/useObjectState';
import { CommandPaletteUI } from './CommandPaletteUI';
import './CommandPaletteSearchBar.scss';

type CommandPaletteSearchBarProps = {
  slot?: string;
  shouldFocus?: boolean;
  setShouldFocus?: Function;
};

export function CommandPaletteSearchBar({
  slot,
  shouldFocus,
  setShouldFocus,
}: CommandPaletteSearchBarProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(shouldFocus || false);
  const [resourceCache, updateResourceCache] = useObjectState<
    Record<string, K8sResource[]>
  >();
  const shouldShowDialog = shouldFocus ? shouldFocus : open;

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
      {shouldShowDialog &&
        createPortal(
          <CommandPaletteUI
            showCommandPalette={shouldShowDialog}
            hide={() => {
              setShowDialog(false);
              if (setShouldFocus) setShouldFocus(false);
            }}
            resourceCache={resourceCache}
            updateResourceCache={updateResourceCache}
          />,
          document.body,
        )}
    </>
  );
}
