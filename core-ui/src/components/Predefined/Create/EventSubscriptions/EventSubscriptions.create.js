import React, { useState } from 'react';
import { createEventSubscriptionTemplate } from './templates';

import { ResourceForm } from 'shared/ResourceForm';

//the name of the function cannot have 'Event' prefix otherwise 'create' button isn't displayed
const SubscriptionsCreate = ({
  onChange,
  formElementRef,
  namespace,
  resourceUrl,
}) => {
  const [eventSubscription, setEventSubscription] = useState(
    createEventSubscriptionTemplate(namespace),
  );

  return (
    <ResourceForm
      pluralKind="eventsubscriptions"
      singularName="Event Subscription"
      resource={eventSubscription}
      setResource={setEventSubscription}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      onlyYaml
    />
  );
};
export { SubscriptionsCreate };
