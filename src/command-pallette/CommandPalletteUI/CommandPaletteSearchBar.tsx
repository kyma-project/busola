import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Icon, Input } from '@ui5/webcomponents-react';
import { K8sResource } from 'types';
import { useObjectState } from 'shared/useObjectState';
import { CommandPaletteUI } from './CommandPaletteUI';
import { useRecoilValue } from 'recoil';
import { availableNodesSelector } from 'state/navigation/availableNodesSelector';
import { SCREEN_SIZE_BREAKPOINT_M } from './types';
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
  useRecoilValue(availableNodesSelector); // preload the values to prevent page rerenders
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

  useEffect(() => {
    const headerSlot = document
      .querySelector('ui5-shellbar')
      ?.shadowRoot?.querySelector('.ui5-shellbar-search-field') as HTMLElement;
    if (headerSlot && window.innerWidth > SCREEN_SIZE_BREAKPOINT_M) {
      // search bar has to be always visible on big screen
      document
        .querySelector('ui5-shellbar')
        ?.setAttribute('show-search-field', '');
      headerSlot.style.display = 'flex';
    } else if (headerSlot) {
      document
        .querySelector('ui5-shellbar')
        ?.removeAttribute('show-search-field');
      headerSlot.style.display = 'none';
    }
  }, [window.innerWidth, document.querySelector('ui5-shellbar')]); // eslint-disable-line react-hooks/exhaustive-deps

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
