import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';
import { createTemplate } from './templates';
import * as jp from 'jsonpath';
import * as Inputs from 'shared/ResourceForm/inputs';
import { useGet } from 'react-shared';
import { useGetList } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField } from 'shared/ResourceForm/fields';
import { ComboboxInput } from 'shared/ResourceForm/inputs';

const DEFAULT_EVENT_TYPE_PREFIX = 'sap.kyma.custom.';

const SubscriptionsCreate = ({
  onChange,
  formElementRef,
  namespace,
  resource: initialEventSubscription,
  resourceUrl,
}) => {
  const t = useTranslation();

  const [ownerName, setOwnerName] = useState(''); //checkbox for functions
  const [version, setVersion] = useState('');
  const [appName, setAppName] = useState('');
  const [eventName, setEventName] = useState('');
  const [isFunctionChosen, setIsFunctionChosen] = useState(true);
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

  const { services } = useGetList()(`/api/v1/namespaces/${namespace}/services`);
  const { functions } = useGetList()(
    `/apis/serverless.kyma-project.io/v1alpha1/namespaces/${namespace}/functions`,
  );
  console.log(functions);

  useEffect(() => {
    const eventTypeValue = `${eventTypePrefix}${appName}.${eventName}.${version}`;
    jp.value(
      eventSubscription,
      '$.spec.filter.filters[0].evenType.value',
      eventTypeValue,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appName, eventName, version]);

  useEffect(() => {
    const sink = `http://${ownerName}.${namespace}.svc.cluster.local`;

    jp.value(eventSubscription, '$.spec.sink', sink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerName]);

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
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind="event subscription"
        setValue={name => {
          jp.value(eventSubscription, '$.metadata.name', name);
          setEventSubscription({ ...eventSubscription });
        }}
        readOnly={!!initialEventSubscription}
      />
      <ResourceForm.FormField
        required
        label="Version"
        tooltipContent="Version"
        input={Inputs.Text}
        maxLength={64}
        placeholder="version"
        value={version}
        setValue={version => setVersion(version)}
      />

      <ResourceForm.FormField
        advanced
        required
        label="functions"
        defaultValue=""
        input={Inputs.Dropdown}
        options={(functions || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
      />
    </ResourceForm>
  );
};
SubscriptionsCreate.allowEdit = true;
export { SubscriptionsCreate };
