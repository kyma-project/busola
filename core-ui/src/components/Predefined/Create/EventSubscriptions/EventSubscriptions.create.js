import React, { useState, useEffect } from 'react';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { useGet, useGetList, useNotification } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm';
import {
  K8sNameField,
  TextArrayInput,
  KeyValueField,
} from 'shared/ResourceForm/fields';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import * as Inputs from 'shared/ResourceForm/inputs';
import { ComboboxInput, MessageStrip } from 'fundamental-react';
import { createEventSubscriptionTemplate } from './templates';
import { getServiceName, getEventFilter, spreadEventType } from './helpers';

const DEFAULT_EVENT_TYPE_PREFIX = 'sap.kyma.custom.';
const versionOptions = ['v1', 'v2', 'v3', 'v4'];

//checks if the eventName consist of at least two parts divided by a dot
const eventNamePattern = '[A-Za-z0-9-]+.[A-Za-z0-9-.]+[A-Za-z0-9-]';

//first three validate the prefix, 4th application name, 5th and 6th event name
const eventTypePattern =
  '[A-Za-z]+\\.[A-Za-z]+\\.[A-Za-z]+\\.[a-z0-9\\-]+\\.[A-Za-z0-9\\-]+\\.[A-Za-z0-9\\-]+\\.+[A-Za-z0-9\\-\\.]+[^\\.]';

const isEventTypeValid = eventType => {
  console.log(eventType);
  if (eventType === null) return '';

  const segments = eventType?.split('.');
  console.log(segments);
  if (segments?.length < 7) return 'is-invalid';

  const prefixRegex = /[A-Za-z]+/;
  const appNameRegex = /[a-z0-9\-]+/;
  const nameAndVersionRegex = /[A-Za-z0-9\-]/;

  return segments?.every((segment, index) => {
    if (index < 3) return prefixRegex.test(segment);
    else if (index === 3) return appNameRegex.test(segment);
    else return nameAndVersionRegex.test(segment);
  })
    ? ''
    : 'is-invalid';
};

const SubscriptionsCreate = ({
  onChange,
  formElementRef,
  namespace,
  resource: initialEventSubscription,
  resourceUrl,
  serviceName = '',
  setCustomValid,
}) => {
  const { t } = useTranslation();
  const { data: configMap } = useGet(
    '/api/v1/namespaces/kyma-system/configmaps/eventing',
  );
  let eventTypePrefix =
    configMap?.data?.eventTypePrefix || DEFAULT_EVENT_TYPE_PREFIX;
  eventTypePrefix = eventTypePrefix.endsWith('.')
    ? eventTypePrefix
    : eventTypePrefix + '.';

  const [eventSubscription, setEventSubscription] = useState(
    cloneDeep(initialEventSubscription) ||
      createEventSubscriptionTemplate(namespace, eventTypePrefix, serviceName),
  );

  const firstEventType = jp.value(
    eventSubscription,
    '$.spec.filter.filters[0].eventType.value',
  );
  const firstEventTypeValues = spreadEventType(firstEventType, eventTypePrefix);

  const notification = useNotification();

  useEffect(() => {
    if (serviceName) {
      jp.value(
        eventSubscription,
        '$.spec.sink',
        `https://${serviceName}.${namespace}.svc.cluster.local`,
      );
      setEventSubscription({ ...eventSubscription });
    }
  }, [serviceName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEventTypeValuesChange = changes => {
    const newEventTypeValues = { ...firstEventTypeValues, ...changes };

    jp.value(
      eventSubscription,
      '$.spec.filter.filters[0].eventType.value',
      `${eventTypePrefix}${newEventTypeValues.appName}.${newEventTypeValues.eventName}.${newEventTypeValues.version}`,
    );
    jp.value(eventSubscription, '$.spec.filter.filters', [
      ...jp.value(eventSubscription, '$.spec.filter.filters'),
    ]);
    setEventSubscription({ ...eventSubscription });
  };

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

  const afterCreatedFn = async defaultAfterCreatedFn => {
    if (!serviceName) {
      defaultAfterCreatedFn();
    } else {
      //when serviceName is given,display notification and don't redirect
      notification.notifySuccess({
        content: t(
          initialEventSubscription
            ? 'common.create-form.messages.patch-success'
            : 'common.create-form.messages.create-success',
          {
            resourceType: t(`subscription.name_singular`),
          },
        ),
      });
    }
  };

  return (
    <ResourceForm
      pluralKind="eventsubscription"
      singularName={t('subscription.name_singular')}
      navigationResourceName="eventsubscriptions"
      resource={eventSubscription}
      setResource={setEventSubscription}
      onChange={onChange}
      formElementRef={formElementRef}
      initialResource={initialEventSubscription}
      createUrl={resourceUrl}
      afterCreatedFn={afterCreatedFn}
      setCustomValid={setCustomValid}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('subscription.name_singular')}
        setValue={name => {
          jp.value(eventSubscription, '$.metadata.name', name);
          setEventSubscription({ ...eventSubscription });
        }}
        readOnly={!!initialEventSubscription}
      />
      <ResourceForm.FormField
        label={t('subscription.create.labels.sink')}
        messageStrip={
          <MessageStrip type="info">
            {jp.value(eventSubscription, '$.spec.sink')}
          </MessageStrip>
        }
        tooltipContent={t('subscription.tooltips.sink')}
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
        value={
          serviceName ||
          getServiceName(jp.value(eventSubscription, '$.spec.sink')) ||
          ''
        }
        validate={() =>
          getServiceName(jp.value(eventSubscription, '$.spec.sink'))
        }
        input={Inputs.Dropdown}
        placeholder={t('subscription.create.placeholders.service-name')}
        options={(services || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
        error={servicesError}
        loading={servicesLoading}
        tooltipContent={t('subscription.tooltips.service-name')}
      />

      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />

      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('subscription.create.labels.application-name')}
        setValue={appName => handleEventTypeValuesChange({ appName })}
        value={firstEventTypeValues.appName}
        input={Inputs.Dropdown}
        placeholder={t('subscription.create.placeholders.application-name')}
        validate={value => {
          const eventType = jp.value(
            value,
            '$.spec.filter.filters[0].eventType.value',
          );
          const { appName } = spreadEventType(eventType, eventTypePrefix);
          return appName;
        }}
        options={(applications || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
        error={applicationsError}
        loading={applicationsLoading}
        tooltipContent={t('subscription.tooltips.application-name')}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('subscription.create.labels.event-name')}
        setValue={eventName => handleEventTypeValuesChange({ eventName })}
        value={firstEventTypeValues.eventName}
        input={Inputs.Text}
        placeholder={t('subscription.create.placeholders.event-name')}
        tooltipContent={t('subscription.tooltips.event-name')}
        pattern={eventNamePattern}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('subscription.create.labels.event-version')}
        tooltipContent={t('subscription.tooltips.event-version')}
        value={firstEventTypeValues.version}
        input={({ value, setValue }) => (
          <ComboboxInput
            required
            compact
            placeholder={t('subscription.create.placeholders.event-version')}
            options={versionOptions.map(version => ({
              key: version,
              text: version,
            }))}
            selectedKey={value}
            typedValue={value}
            onSelect={e => {
              handleEventTypeValuesChange({ version: e.target.value });
            }}
          />
        )}
      />
      <ResourceForm.FormField
        simple
        label={t('subscription.create.labels.event-type')}
        messageStrip={
          <MessageStrip type="info">
            {jp.value(
              eventSubscription,
              '$.spec.filter.filters[0].eventType.value',
            )}
          </MessageStrip>
        }
        tooltipContent={t('subscription.tooltips.event-type-simple')}
      />
      <TextArrayInput
        advanced
        required
        defaultOpen
        tooltipContent={t('subscription.tooltips.event-type-advanced')}
        propertyPath="$.spec.filter.filters"
        title={t('subscription.create.labels.event-type')}
        toInternal={valueFromYaml =>
          valueFromYaml?.map(obj => obj.eventType?.value) || []
        }
        toExternal={valueFromComponent =>
          valueFromComponent
            ?.filter(Boolean)
            .map(value => getEventFilter(value)) || []
        }
        customFormatFn={arr => arr.map(getEventFilter)}
        placeholder={t('subscription.create.placeholders.event-type')}
        validate={value => {
          return value.every(e => {
            if (e.eventType.value.split('.').filter(s => s).length < 7) {
              return false;
            } else {
              return true;
            }
          });
        }}
        validateSingleValue={isEventTypeValid}
      />
      {(jp.value(eventSubscription, '$.spec.filter.filters') || []).length ===
      0 ? (
        <MessageStrip
          advanced
          type="warning"
          className="fd-margin-top--sm fd-margin-bottom--sm"
        >
          {t('subscription.errors.empty-event-types')}
        </MessageStrip>
      ) : null}
    </ResourceForm>
  );
};
SubscriptionsCreate.allowEdit = true;
export { SubscriptionsCreate };
