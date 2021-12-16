import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createEventSubscriptionTemplate } from './templates';

import { ResourceForm } from 'shared/ResourceForm';

//the name of the function cannot have 'Event' prefix otherwise 'create' button isn't displayed
const SubscriptionsCreate = ({
  onChange,
  formElementRef,
  namespace,
  resource: initialEventSubscription,
  resourceUrl,
}) => {
  const t = useTranslation();

  const [eventSubscription, setEventSubscription] = useState(
    createEventSubscriptionTemplate(namespace),
  );

  return (
    <ResourceForm
      pluralKind="subscriptions"
      resource={eventSubscription}
      singularName="eventsubscription"
      setResource={setEventSubscription}
      onChange={onChange}
      formElementRef={formElementRef}
      initialResource={initialEventSubscription}
      createUrl={resourceUrl}
      onlyYaml
    />
  );
};
export { SubscriptionsCreate };
