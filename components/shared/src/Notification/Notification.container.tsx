import React, { useContext } from 'react';

import { NotificationsService } from '@kyma-project/common';
import { Notification } from './Notification.component';

export interface NotificationContainerProps {
  orientation?: string;
}

export const NotificationContainer: React.FunctionComponent<NotificationContainerProps> = ({
  orientation = 'bottom',
}) => {
  const { notification, showNotification, hideNotification } = useContext(
    NotificationsService,
  );

  return (
    <Notification
      {...notification}
      icon={undefined} // temp - we're going to remove this library anyways
      orientation={orientation}
      visible={showNotification}
      onClick={hideNotification}
    />
  );
};
