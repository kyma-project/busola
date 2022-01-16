import React, { useState } from 'react';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { useGetList, useNotification } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm';
import {
  K8sNameField,
  TextArrayInput,
  KeyValueField,
} from 'shared/ResourceForm/fields';

import * as Inputs from 'shared/ResourceForm/inputs';
import { ComboboxInput, MessageStrip } from 'fundamental-react';
import { createSubscriptionTemplate } from './templates';
import { getServiceName, getEventFilter, spreadEventType } from './helpers';

const DEFAULT_EVENT_TYPE_PREFIX = 'sap.kyma.custom.';
const versionOptions = ['v1', 'v2', 'v3', 'v4'];

const SubscriptionsCreate = ({
  onChange,
  formElementRef,
  namespace,
  resource: initialSubscription,
  resourceUrl,
  serviceName = '',
  setCustomValid,
}) => {
  const { t } = useTranslation();

  const [subscription, setSubscription] = useState(
    cloneDeep(initialSubscription) ||
      createSubscriptionTemplate(
        namespace,
        DEFAULT_EVENT_TYPE_PREFIX,
        serviceName,
      ),
  );

  const firstEventType = jp.value(
    subscription,
    '$.spec.filter.filters[0].eventType.value',
  );

  const firstEventTypeValues = spreadEventType(
    firstEventType,
    DEFAULT_EVENT_TYPE_PREFIX,
  );

  const notification = useNotification();

  const handleEventTypeValuesChange = changes => {
    const newEventTypeValues = { ...firstEventTypeValues, ...changes };

    jp.value(
      subscription,
      '$.spec.filter.filters[0].eventType.value',
      `${DEFAULT_EVENT_TYPE_PREFIX}${newEventTypeValues.appName}.${newEventTypeValues.eventName}.${newEventTypeValues.version}`,
    );
    jp.value(subscription, '$.spec.filter.filters', [
      ...jp.value(subscription, '$.spec.filter.filters'),
    ]);
    setSubscription({ ...subscription });
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
          initialSubscription
            ? 'common.create-form.messages.patch-success'
            : 'common.create-form.messages.create-success',
          {
            resourceType: t(`subscription.name_singular`),
          },
        ),
      });
    }
  };

  const sinkMessageStrip = (
    <MessageStrip type="info">
      {jp.value(subscription, '$.spec.sink')}
    </MessageStrip>
  );

  const eventTypeMessageStrip = (
    <MessageStrip type="info">
      {jp.value(subscription, '$.spec.filter.filters[0].eventType.value')}
    </MessageStrip>
  );

  return (
    <ResourceForm
      pluralKind="subscriptions"
      singularName={t('subscription.name_singular')}
      resource={subscription}
      setResource={setSubscription}
      onChange={onChange}
      formElementRef={formElementRef}
      initialResource={initialSubscription}
      createUrl={resourceUrl}
      afterCreatedFn={afterCreatedFn}
      setCustomValid={setCustomValid}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('subscription.name_singular')}
        setValue={name => {
          jp.value(subscription, '$.metadata.name', name);
          setSubscription({ ...subscription });
        }}
        readOnly={!!initialSubscription}
      />
      <ResourceForm.FormField
        label={t('subscription.create.labels.sink')}
        messageStrip={sinkMessageStrip}
        tooltipContent={t('subscription.tooltips.sink')}
      />

      <ResourceForm.FormField
        required
        label={t('subscription.create.labels.service-name')}
        setValue={serviceName => {
          jp.value(
            subscription,
            '$.spec.sink',
            `http://${serviceName}.${namespace}.svc.cluster.local`,
          );
          setSubscription({ ...subscription });
        }}
        value={
          serviceName ||
          getServiceName(jp.value(subscription, '$.spec.sink')) ||
          ''
        }
        validate={() => getServiceName(jp.value(subscription, '$.spec.sink'))}
        input={Inputs.Dropdown}
        placeholder={t('subscription.create.placeholders.service-name')}
        options={(services || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
        error={servicesError}
        loading={servicesLoading}
        tooltipContent={t('subscription.tooltips.service-name')}
        disabled={!!serviceName}
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
          const { appName } = spreadEventType(
            eventType,
            DEFAULT_EVENT_TYPE_PREFIX,
          );
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
        messageStrip={eventTypeMessageStrip}
        tooltipContent={t('subscription.tooltips.event-type-simple')}
      />
      <TextArrayInput
        advanced
        required
        defaultOpen
        tooltipContent={t('subscription.tooltips.event-type-advanced')}
        propertyPath="$.spec.filter.filters"
        title={t('subscription.create.labels.event-type-plural')}
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
        inputProps={{
          validate: value => {
            return value === 'foo';
          },
        }}
      />
      {(jp.value(subscription, '$.spec.filter.filters') || []).length === 0 ? (
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
