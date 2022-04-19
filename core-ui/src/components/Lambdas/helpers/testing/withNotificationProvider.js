import React from 'react';
import { NotificationProvider } from 'shared/contexts/NotificationContext';

export function withNotificationProvider({ component = null }) {
  return (
    <NotificationProvider defaultVisibilityTime={0}>
      {component}
    </NotificationProvider>
  );
}
