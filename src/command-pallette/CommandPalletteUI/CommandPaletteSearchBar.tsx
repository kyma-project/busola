import { useEffect, RefObject, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { Icon, Input } from '@ui5/webcomponents-react';
import { K8sResource } from 'types';
import { useEventListener } from 'hooks/useEventListener';
import { useObjectState } from 'shared/useObjectState';
import { CommandPaletteUI } from './CommandPaletteUI';
import { SCREEN_SIZE_BREAKPOINT_M } from './types';
import './CommandPaletteSearchBar.scss';

type CommandPaletteSearchBarProps = {
  slot?: string;
  shouldFocus?: boolean;
  setShouldFocus?: Function;
  shellbarRef?: RefObject<HTMLElement>;
};

export function CommandPaletteSearchBar({
  slot,
  shouldFocus,
  setShouldFocus,
  shellbarRef,
}: CommandPaletteSearchBarProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(shouldFocus || false);
  const [shellbarWidth] = useState(window.innerWidth);
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

  useEffect(() => {
    const shellbarCurr = shellbarRef?.current;
    const searchButton = shellbarCurr?.shadowRoot?.querySelector(
      '.ui5-shellbar-search-button',
    ) as HTMLElement;
    const searchField = shellbarCurr?.shadowRoot?.querySelector(
      '.ui5-shellbar-search-field',
    ) as HTMLElement;

    if (searchButton && shellbarWidth > SCREEN_SIZE_BREAKPOINT_M) {
      searchButton.style.display = 'none';

      // search bar has to be always visible on big screen
      shellbarCurr?.setAttribute('show-search-field', '');
    } else if (searchButton && searchField) {
      searchButton.style.display = 'inline-block';
      shellbarCurr?.removeAttribute('show-search-field');
      searchField.style.display = 'none';
    }
  }, [shellbarRef?.current, shellbarWidth, shouldShowDialog]); // eslint-disable-line react-hooks/exhaustive-deps

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
