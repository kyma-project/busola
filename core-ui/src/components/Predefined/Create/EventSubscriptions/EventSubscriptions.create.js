import { ComboboxInput } from 'fundamental-react';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGet, useGetList } from 'react-shared';
import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField, TextArrayInput } from 'shared/ResourceForm/fields';
import * as Inputs from 'shared/ResourceForm/inputs';
import { createEventSubscriptionTemplate } from './templates';

const DEFAULT_EVENT_TYPE_PREFIX = 'sap.kyma.custom.';
const versionOptions = ['v1', 'v2', 'v3', 'v4'];

const getEventFilter = value => {
  return {
    eventSource: {
      property: 'source',
      type: 'exact',
      value: '',
    },
    eventType: {
      property: 'type',
      type: 'exact',
      value,
    },
  };
};

const SubscriptionsCreate = ({
  onChange,
  formElementRef,
  namespace,
  resource: initialEventSubscription,
  resourceUrl,
}) => {
  const { t } = useTranslation();

  const [ownerName, setOwnerName] = useState(''); //checkbox for functions
  const [version, setVersion] = useState('');
  const [appName, setAppName] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventSubscription, setEventSubscription] = useState(
    cloneDeep(initialEventSubscription) ||
      createEventSubscriptionTemplate(namespace),
  );

  const { data: configMap } = useGet(
    '/api/v1/namespaces/kyma-system/configmaps/eventing',
  );

  let eventTypePrefix =
    configMap?.data?.eventTypePrefix || DEFAULT_EVENT_TYPE_PREFIX;
  eventTypePrefix = eventTypePrefix.endsWith('.')
    ? eventTypePrefix
    : eventTypePrefix + '.';
  const [eventType, setEventType] = useState(eventTypePrefix);

  const {
    data: services,
    error: servicesError,
    loading: servicesLoading,
  } = useGetList()(`/api/v1/namespaces/${namespace}/services`);

  const {
    data: applications,
    error: applicationsError,
    loading: applicationsLoading,
  } = useGetList()(
    `/apis/applicationconnector.kyma-project.io/v1alpha1/applications`,
  );

  useEffect(() => {
    setEventType(`${eventTypePrefix}${appName}.${eventName}.${version}`);
    jp.value(
      eventSubscription,
      '$.spec.filter.filters[0].eventType.value',
      eventType,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appName, eventName, version]);

  useEffect(() => {
    const sink = `https://${ownerName}.${namespace}.svc.cluster.local`;

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
        kind={t('event-subscription.singular_name')}
        setValue={name => {
          jp.value(eventSubscription, '$.metadata.name', name);
          setEventSubscription({ ...eventSubscription });
        }}
        readOnly={!!initialEventSubscription}
      />
      <ResourceForm.FormField
        simple
        required
        label={t('event-subscription.create.labels.application-name')}
        setValue={applicationName => setAppName(applicationName)}
        value={appName}
        input={Inputs.Dropdown}
        options={(applications || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
        error={applicationsError}
        loading={applicationsLoading}
      />
      <ResourceForm.FormField
        simple
        required
        label={t('event-subscription.create.labels.event-name')}
        setValue={eventName => setEventName(eventName)}
        value={eventName}
        input={Inputs.Text}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('event-subscription.create.labels.event-version')}
        value={version}
        input={({ value, setValue }) => (
          <ComboboxInput
            required
            compact
            placeholder={t('event-subscription.create.labels.event-version')}
            options={versionOptions.map(version => ({
              key: version,
              text: version,
            }))}
            selectedKey={value}
            typedValue={value}
            onSelect={e => setVersion(e.target.value)}
          />
        )}
      />
      <ResourceForm.FormField
        simple
        required
        label={t('event-subscription.create.labels.event-type')}
        value={eventType}
        input={Inputs.Text}
        readOnly={true}
      />
      <ResourceForm.FormField
        required
        label={t('services.name_singular')}
        setValue={serviceName => setOwnerName(serviceName)}
        value={ownerName}
        input={Inputs.Dropdown}
        options={(services || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
        error={servicesError}
        loading={servicesLoading}
      />
      <TextArrayInput
        advanced
        required
        defaultOpen
        propertyPath="$.spec.filter.filters"
        validate={val => !!val}
        title={t('event-subscription.filters.title')}
        toInternal={valueFromYaml => {
          return valueFromYaml.map(obj => obj.eventType.value) || [];
        }}
        toExternal={valueFromComponent =>
          valueFromComponent.reduce((accumulator, currentValue) => {
            if (currentValue) accumulator.push(getEventFilter(currentValue));
            return accumulator;
          }, [])
        }
        placeholder="Event type"
      />
    </ResourceForm>
  );
};
SubscriptionsCreate.allowEdit = true;
export { SubscriptionsCreate };
