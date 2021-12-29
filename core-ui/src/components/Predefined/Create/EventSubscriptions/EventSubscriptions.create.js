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

import * as Inputs from 'shared/ResourceForm/inputs';
import { ComboboxInput, MessageStrip } from 'fundamental-react';
import { createEventSubscriptionTemplate } from './templates';
import {
  getServiceName,
  validateEventSubscription,
  getEventFilter,
  spreadEventType,
} from './helpers';

const DEFAULT_EVENT_TYPE_PREFIX = 'sap.kyma.custom.';
const versionOptions = ['v1', 'v2', 'v3', 'v4'];

const SubscriptionsCreate = ({
  onChange,
  formElementRef,
  namespace,
  resource: initialEventSubscription,
  resourceUrl,
  serviceName,
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
      createEventSubscriptionTemplate(namespace, eventTypePrefix),
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

  useEffect(() => {
    setCustomValid(
      validateEventSubscription(
        eventSubscription,
        firstEventTypeValues.appName,
      ),
    );
  }, [firstEventTypeValues.appName, eventSubscription, setCustomValid]);

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

  const handleNoResource = (resourceArray, name, error) => {
    if (error) return error;

    const isResourceFound = (resourceArray || [])
      ?.map(obj => obj.metadata.name)
      .includes(name);

    if (!isResourceFound)
      return new Error(t('common.messages.entry-not-found'));
  };

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
            resourceType: t(`event-subscription.name_singular`),
          },
        ),
      });
    }
  };

  return (
    <ResourceForm
      pluralKind="eventsubscription"
      singularName={t('event-subscription.name_singular')}
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
        kind={t('event-subscription.name_singular')}
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
        value={
          serviceName ||
          getServiceName(jp.value(eventSubscription, '$.spec.sink')) ||
          ''
        }
        input={Inputs.Dropdown}
        placeholder={t('event-subscription.create.placeholders.service-name')}
        options={(services || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
        loading={servicesLoading}
        tooltipContent={t('event-subscription.tooltips.service-name')}
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
        label={t('event-subscription.create.labels.application-name')}
        setValue={appName => handleEventTypeValuesChange({ appName })}
        value={firstEventTypeValues.appName}
        input={Inputs.Dropdown}
        placeholder={t(
          'event-subscription.create.placeholders.application-name',
        )}
        options={(applications || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
        loading={applicationsLoading}
        tooltipContent={t('event-subscription.tooltips.application-name')}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('event-subscription.create.labels.event-name')}
        setValue={eventName => handleEventTypeValuesChange({ eventName })}
        value={firstEventTypeValues.eventName}
        input={Inputs.Text}
        placeholder={t('event-subscription.create.labels.event-name')}
        tooltipContent={t('event-subscription.tooltips.event-name')}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('event-subscription.create.labels.event-version')}
        tooltipContent={t('event-subscription.tooltips.event-version')}
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
              handleEventTypeValuesChange({ version: e.target.value });
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
        tooltipContent={t('event-subscription.tooltips.event-type-simple')}
      />

      <TextArrayInput
        advanced
        required
        defaultOpen
        tooltipContent={t('event-subscription.tooltips.event-type-advanced')}
        propertyPath="$.spec.filter.filters"
        validate={val => !!val}
        title={t('event-subscription.create.labels.event-type')}
        toInternal={valueFromYaml =>
          valueFromYaml?.map(obj => obj.eventType.value) || []
        }
        toExternal={valueFromComponent =>
          valueFromComponent
            .filter(Boolean)
            .map(value => getEventFilter(value)) || []
        }
        placeholder={t('event-subscription.create.labels.event-type')}
      />
      {(jp.value(eventSubscription, '$.spec.filter.filters') || []).length ===
      0 ? (
        <MessageStrip
          advanced
          type="warning"
          className="fd-margin-top--sm fd-margin-bottom--sm"
        >
          {t('event-subscription.errors.empty-event-types')}
        </MessageStrip>
      ) : null}
    </ResourceForm>
  );
};
SubscriptionsCreate.allowEdit = true;
export { SubscriptionsCreate };
