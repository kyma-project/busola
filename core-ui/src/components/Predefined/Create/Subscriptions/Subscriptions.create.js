import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';
import { createTemplate } from './templates';
import { useGet } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm';

const DEFAULT_EVENT_TYPE_PREFIX = 'sap.kyma.custom.';

const SubscriptionsCreate = ({
  onChange,
  formElementRef,
  namespace,
  resource: initialEventSubscription,
  resourceUrl,
}) => {
  const t = useTranslation();

  const [eventSubscription, setEventSubscription] = useState(
    cloneDeep(initialEventSubscription) || createTemplate(namespace),
  );

  const { data: configMap } = useGet(
    '/api/v1/namespaces/kyma-system/configmaps/eventing',
  );

  let eventTypePrefix =
    configMap?.data?.eventTypePrefix || DEFAULT_EVENT_TYPE_PREFIX;
  eventTypePrefix = eventTypePrefix.endsWith('.')
    ? eventTypePrefix
    : eventTypePrefix + '.';

  return (
    <ResourceForm
      pluralKind="subscriptions"
      singularName="eventsubscription"
      resource={eventSubscription}
      setResource={setEventSubscription}
      onChange={onChange}
      formElementRef={formElementRef}
      initialResource={initialEventSubscription}
      createUrl={resourceUrl}
    ></ResourceForm>
  );
};
SubscriptionsCreate.allowEdit = true;
export { SubscriptionsCreate };
