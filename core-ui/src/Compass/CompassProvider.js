import React, { useEffect, useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { CompassUI } from './CompassUI/CompassUI';
import { withRouter } from 'react-router-dom';
import { useEventListener } from 'hooks/useEventListener';
import { useCustomMessageListener } from 'hooks/useCustomMessageListener';
import { useResourceCache } from './CompassUI/useResourceCache';

export const CompassProvider = withRouter(({ children, history }) => {
  const [showDialog, _setShowDialog] = useState(false);
  const hide = () => setShowDialog(false);
  const [resourceCache, updateResourceCache] = useResourceCache();

  const setShowDialog = value => {
    const modalPresent = document.querySelector(
      '[data-focus-lock-disabled=false]',
    );
    // disable opening Compass if other modal is present
    if (!modalPresent || !value) {
      _setShowDialog(value);
    }
  };

  const onKeyPress = e => {
    const { key, metaKey, ctrlKey } = e;
    const isMac = navigator.platform.toLowerCase().startsWith('mac');
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
  useCustomMessageListener('busola.toggle-compass', () =>
    setShowDialog(showDialog => !showDialog),
  );
  useCustomMessageListener('busola.main-frame-keydown', ({ key }) => {
    if (key === 'Escape') {
      hide();
    }
  });
  useCustomMessageListener('busola.main-frame-click', hide);
  useEffect(() => history.listen(hide), [history, hide]); // hide on nav path change

  return (
    <>
      {showDialog && (
        <CompassUI
          hide={hide}
          resourceCache={resourceCache}
          updateResourceCache={updateResourceCache}
        />
      )}
      {children}
    </>
  );
});
