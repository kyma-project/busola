import React, { useEffect, useState } from 'react';
import { CompassUI } from './CompassUI/CompassUI';
import { withRouter } from 'react-router-dom';
import { useEventListener } from 'hooks/useEventListener';
import { useCustomMessageListener } from 'hooks/useCustomMessageListener';
import { useResourceCache } from './CompassUI/useResourceCache';

export const CompassProvider = withRouter(({ children, history }) => {
  const [showDialog, setShowDialog] = useState(false);
  const hide = () => setShowDialog(false);
  const [resourceCache, updateResourceCache] = useResourceCache();

  const onKeyPress = ({ key, metaKey }) => {
    if (key.toLowerCase() === 'k' && metaKey) {
      setShowDialog(showDialog => !showDialog);
    } else if (key === 'Escape') {
      hide();
    }
  };

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
