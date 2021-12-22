import React, { useState } from 'react';
import { createEventSubscriptionTemplate } from './templates';

import { ResourceForm } from 'shared/ResourceForm';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="eventsubscriptions"
      singularName={t('event-subscription.name_singular')}
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
