import React, { createContext, useContext, useEffect, useState } from 'react';
import { CompassUI } from './CompassUI/CompassUI';
import { withRouter } from 'react-router-dom';
import { useEventListener } from 'hooks/useEventListener';
import { useCustomMessageListener } from 'hooks/useCustomMessageListener';

export const CompassContext = createContext();

export const CompassProvider = withRouter(({ children, history }) => {
  const [showDialog, setShowDialog] = useState(false);
  const hide = () => setShowDialog(false);

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
  useEffect(() => history.listen(hide), [history]);

  return (
    <CompassContext.Provider value={null}>
      {showDialog && <CompassUI hide={hide} />}
      {children}
    </CompassContext.Provider>
  );
});

export function useCompass() {
  return useContext(CompassContext);
}
