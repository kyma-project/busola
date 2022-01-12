import React, { useEffect, useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { CompassUI } from './CompassUI/CompassUI';
import { withRouter } from 'react-router-dom';
import { useEventListener } from 'hooks/useEventListener';
import { useCustomMessageListener } from 'hooks/useCustomMessageListener';
import { useResourceCache } from './CompassUI/useResourceCache';

export const CompassProvider = withRouter(({ children, history }) => {
  const [showDialog, setShowDialog] = useState(false);
  const hide = () => setShowDialog(false);
  const [resourceCache, updateResourceCache] = useResourceCache();

  const onKeyPress = e => {
    // may be undefined when event comes from core
    // [on Firefox] prevent opening the browser search bar via CMD/CTRL+K
    if (e.preventDefault) {
      e.preventDefault();
    }

    const { key, metaKey, ctrlKey } = e;
    const isMac = navigator.platform.toLowerCase().startsWith('mac');
    const modifierKeyPressed = (isMac && metaKey) || (!isMac && ctrlKey);

    if (key.toLowerCase() === 'k' && modifierKeyPressed) {
      setShowDialog(showDialog => !showDialog);
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
  useCustomMessageListener('busola.main-frame-keypress', onKeyPress);
  useCustomMessageListener('busola.main-frame-click', hide);
  useEffect(() => history.listen(hide), [history]); // hide on nav path change

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
