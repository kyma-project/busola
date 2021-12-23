import { ComboboxInput } from 'fundamental-react';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGet, useGetList } from 'react-shared';
import { ResourceForm } from 'shared/ResourceForm';
import {
  K8sNameField,
  TextArrayInput,
  KeyValueField,
} from 'shared/ResourceForm/fields';
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

  const getOwnerName = sink => {
    if (typeof sink !== 'string') return '';

    const startIndex = sink?.lastIndexOf('/') + 1;
    const nextDot = sink?.indexOf('.');
    return sink?.substring(startIndex, nextDot);
  };

  const { data: configMap } = useGet(
    '/api/v1/namespaces/kyma-system/configmaps/eventing',
  );

  let eventTypePrefix =
    configMap?.data?.eventTypePrefix || DEFAULT_EVENT_TYPE_PREFIX;
  eventTypePrefix = eventTypePrefix.endsWith('.')
    ? eventTypePrefix
    : eventTypePrefix + '.';

  const spreadEventType = eventType => {
    if (typeof eventType !== 'string')
      return {
        appName: '',
        eventName: '',
        version: '',
      };

    const eventTypeWithoutPrefix = eventType.substr(eventTypePrefix.length);
    const appName = eventTypeWithoutPrefix.substr(
      0,
      eventTypeWithoutPrefix.indexOf('.'),
    );
    const lastDotIndex = eventTypeWithoutPrefix.lastIndexOf('.');
    const eventName = eventTypeWithoutPrefix.substring(
      appName.length + 1,
      lastDotIndex,
    );
    const version = eventTypeWithoutPrefix.substr(lastDotIndex + 1);

    return {
      appName,
      eventName,
      version,
    };
  };

  const [eventSubscription, setEventSubscription] = useState(
    cloneDeep(initialEventSubscription) ||
      createEventSubscriptionTemplate(namespace, eventTypePrefix),
  );

  const firstEventType = jp.value(
    eventSubscription,
    '$.spec.filter.filters[0].eventType.value',
  );
  const firstEventTypeValues = spreadEventType(firstEventType);

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
        required
        label={t('services.name_singular')}
        setValue={serviceName => {
          jp.value(
            eventSubscription,
            '$.spec.sink',
            `https://${serviceName}.${namespace}.svc.cluster.local`,
          );
          setEventSubscription({ ...eventSubscription });
        }}
        value={getOwnerName(jp.value(eventSubscription, '$.spec.sink')) || ''}
        input={Inputs.Dropdown}
        options={(services || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
        error={servicesError}
        loading={servicesLoading}
      />

      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('event-subscription.create.labels.application-name')}
        setValue={appName => {
          jp.value(
            eventSubscription,
            '$.spec.filter.filters[0].eventType.value',
            `${eventTypePrefix}${appName}.${firstEventTypeValues.eventName}.${firstEventTypeValues.version}`,
          );
          setEventSubscription({ ...eventSubscription });
        }}
        value={firstEventTypeValues.appName}
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
        setValue={eventName => {
          jp.value(
            eventSubscription,
            '$.spec.filter.filters[0].eventType.value',
            `${eventTypePrefix}${firstEventTypeValues.appName}.${eventName}.${firstEventTypeValues.version}`,
          );
          setEventSubscription({ ...eventSubscription });
        }}
        value={firstEventTypeValues.eventName}
        input={Inputs.Text}
        placeholder={t('event-subscription.create.labels.event-name')}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('event-subscription.create.labels.event-version')}
        value={firstEventTypeValues.version}
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
            onSelect={e => {
              jp.value(
                eventSubscription,
                '$.spec.filter.filters[0].eventType.value',
                `${eventTypePrefix}${firstEventTypeValues.appName}.${firstEventTypeValues.eventName}.${e.target.value}`,
              );
              setEventSubscription({ ...eventSubscription });
            }}
          />
        )}
      />
      <ResourceForm.FormField
        simple
        required
        label={t('event-subscription.create.labels.event-type')}
        propertyPath={'$.spec.filter.filters[0].eventType.value'}
        input={Inputs.Text}
        readOnly={true}
      />

      <TextArrayInput
        simple
        required
        defaultOpen
        propertyPath="$.spec.filter.filters"
        validate={val => !!val}
        title={t('event-subscription.filters.title')}
        toInternal={valueFromYaml =>
          valueFromYaml?.map(obj => obj.eventType.value) || []
        }
        toExternal={valueFromComponent =>
          valueFromComponent
            .filter(Boolean)
            .map(value => getEventFilter(value)) || []
        }
        placeholder="Event type value?"
      />
    </ResourceForm>
  );
};
SubscriptionsCreate.allowEdit = true;
export { SubscriptionsCreate };
