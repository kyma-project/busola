import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import LuigiClient from '@luigi-project/client';
import { CompassUI } from './CompassUI';
import './Compass.scss';

export const CompassContext = createContext();

export const CompassProvider = ({ children }) => {
  const [showDialog, setShowDialog] = useState(false);

  const onKeyPress = ({ key, metaKey }) => {
    if (key === 'k' && metaKey) {
      setShowDialog(showDialog => !showDialog);
    } else if (key === 'Escape') {
      setShowDialog(false);
    }
  };

  useEffect(() => {
    const keypressHandle = LuigiClient.addCustomMessageListener(
      'busola.main-frame-keypress',
      onKeyPress,
    );
    const clickHandle = LuigiClient.addCustomMessageListener(
      'busola.main-frame-click',
      () => setShowDialog(false),
    );
    return () => {
      LuigiClient.removeCustomMessageListener(keypressHandle);
      LuigiClient.removeCustomMessageListener(clickHandle);
    };
  }, []);

  const keyDown = useCallback(onKeyPress, []);

  useEffect(() => {
    window.addEventListener('keydown', keyDown);
    return () => window.removeEventListener('keydown', keyDown);
  }, []);

  return (
    <CompassContext.Provider value={null}>
      {showDialog && <CompassUI hide={() => setShowDialog(false)} />}
      {children}
    </CompassContext.Provider>
  );
};

export function useCompass() {
  return useContext(CompassContext);
}
