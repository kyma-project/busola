import React, { useEffect, useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { CommandPaletteUI } from './CommandPalletteUI/CommandPaletteUI';
import { useEventListener } from 'hooks/useEventListener';
import { useCustomMessageListener } from 'hooks/useCustomMessageListener';
import { useResourceCache } from './CommandPalletteUI/useResourceCache';

export const CommandPaletteProvider = ({ children }) => {
  const [showDialog, _setShowDialog] = useState(false);
  const hide = () => setShowDialog(false);
  const [resourceCache, updateResourceCache] = useResourceCache();

  const setShowDialog = value => {
    const modalPresent = document.querySelector(
      '[data-focus-lock-disabled=false]',
    );
    // disable opening pallette if other modal is present
    if (!modalPresent || !value) {
      _setShowDialog(value);
    }
  };

  const onKeyPress = e => {
    const { key, metaKey, ctrlKey } = e;
    // for (Edge, Chrome) || (Firefox, Safari)
    const isMac = (navigator.userAgentData?.platform || navigator.platform)
      .toLowerCase()
      .startsWith('mac');
    const modifierKeyPressed = (isMac && metaKey) || (!isMac && ctrlKey);

    if (key.toLowerCase() === 'k' && modifierKeyPressed) {
      setShowDialog(showDialog => !showDialog);
      // [on Firefox] prevent opening the browser search bar via CMD/CTRL+K
      e.preventDefault();
    } else if (key === 'Escape') {
      hide();
    }
  };

  useEffect(() => {
    if (showDialog) {
      LuigiClient.uxManager().addBackdrop();
    } else {
      LuigiClient.uxManager().removeBackdrop();
    }
  }, [showDialog]);

  useEventListener('keydown', onKeyPress);
  useCustomMessageListener('busola.toggle-command-palette', () =>
    setShowDialog(showDialog => !showDialog),
  );
  useCustomMessageListener('busola.main-frame-keydown', ({ key }) => {
    if (key === 'Escape') {
      hide();
    }
  });
  useCustomMessageListener('busola.main-frame-click', hide);

  return (
    <>
      {showDialog && (
        <CommandPaletteUI
          hide={hide}
          resourceCache={resourceCache}
          updateResourceCache={updateResourceCache}
        />
      )}
      {children}
    </>
  );
};
