import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Icon, Input } from '@ui5/webcomponents-react';
import { K8sResource } from 'types';
import { useEventListener } from 'hooks/useEventListener';
import { useObjectState } from 'shared/useObjectState';
import { CommandPaletteUI } from './CommandPaletteUI';

type CommandPaletteSearchBarProps = {
  slot?: string;
  shouldFocus?: boolean;
  setShouldFocus?: (_: boolean) => void;
  shellbarWidth: number;
};

export function CommandPaletteSearchBar({
  slot,
  shouldFocus,
  setShouldFocus,
  shellbarWidth,
}: CommandPaletteSearchBarProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(shouldFocus || false);
  const [resourceCache, updateResourceCache] =
    useObjectState<Record<string, K8sResource[]>>();
  const shouldShowDialog = shouldFocus ? shouldFocus : open;

  const htmlWrapEl = document.getElementById('html-wrap');

  const setShowDialog = (value: boolean) => {
    const modalPresent =
      document.querySelector('ui5-dialog[open]') ||
      document.querySelector('.command-palette-ui');
    // disable opening palette if other modal is present
    if (!modalPresent || !value) {
      setOpen(value);
    }
  };

  const onKeyPress = (e: Event) => {
    const { key, metaKey, ctrlKey } = e as KeyboardEvent;
    // for (Edge, Chrome) || (Firefox, Safari)
    const isMac = (
      (navigator as any).userAgentData?.platform || navigator.platform
    )
      ?.toLowerCase()
      ?.startsWith('mac');
    const modifierKeyPressed = (isMac && metaKey) || (!isMac && ctrlKey);

    if (
      (key === 'k' || key === 'K') &&
      modifierKeyPressed &&
      window.location.pathname !== '/clusters'
    ) {
      setShowDialog(!shouldShowDialog);
      // [on Firefox] prevent opening the browser search bar via CMD/CTRL+K
      e.preventDefault();
    }
  };

  useEventListener('keydown', onKeyPress, [shouldShowDialog]);

  return (
    <>
      <Input
        id="command-palette-search-bar"
        accessibleName="command-palette-search-bar"
        onClick={() => setOpen(true)}
        onInput={(e) => e.preventDefault()}
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
            shellbarWidth={shellbarWidth}
          />,
          htmlWrapEl || document.body,
        )}
    </>
  );
}
