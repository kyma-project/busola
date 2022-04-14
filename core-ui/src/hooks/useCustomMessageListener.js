import LuigiClient from '@luigi-project/client';
import { useEffect } from 'react';

export function useCustomMessageListener(eventId, handler) {
  useEffect(() => {
    const handleId = LuigiClient.addCustomMessageListener(eventId, handler);
    return () => LuigiClient.removeCustomMessageListener(handleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
