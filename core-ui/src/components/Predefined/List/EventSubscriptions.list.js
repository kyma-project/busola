import React from 'react';

export const SubscriptionsList = ({ DefaultRenderer, ...otherParams }) => {
  return (
    <DefaultRenderer resourceName="Event Subscriptions" {...otherParams} />
  );
};
