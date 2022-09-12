import React, { useState } from 'react';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { ComboboxInput, MessageStrip } from 'fundamental-react';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useNotification } from 'shared/contexts/NotificationContext';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

import { createSubscriptionTemplate } from './templates';
import {
  getServiceName,
  spreadEventType,
  DEFAULT_EVENT_TYPE_PREFIX,
} from './helpers';
import { FiltersSection } from './FiltersSection';

const versionOptions = ['v1', 'v2', 'v3', 'v4'];

export const SubscriptionCreate = ({
  onChange,
  formElementRef,
  namespace,
  resource: initialSubscription,
  resourceUrl,
  serviceName = '',
  setCustomValid,
  prefix,
  ...props
}) => {
  const { t } = useTranslation();
  const notification = useNotification();

  const [subscription, setSubscription] = useState(
    cloneDeep(initialSubscription) ||
      createSubscriptionTemplate(namespace, serviceName),
  );

  const firstEventType = jp.value(
    subscription,
    '$.spec.filter.filters[0].eventType.value',
  );

  const firstEventTypeValues = spreadEventType(
    firstEventType,
    DEFAULT_EVENT_TYPE_PREFIX,
  );

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
            resourceType: t(`subscriptions.name_singular`),
          },
        ),
      });
    }
  };

  const sinkMessageStrip = (
    <MessageStrip>{jp.value(subscription, '$.spec.sink')}</MessageStrip>
  );

  const eventTypeMessageStrip = (
    <MessageStrip>
      {jp.value(subscription, '$.spec.filter.filters[0].eventType.value')}
    </MessageStrip>
  );

  return (
    <ResourceForm
      {...props}
      pluralKind="subscriptions"
      singularName={t('subscriptions.name_singular')}
      resource={subscription}
      setResource={setSubscription}
      onChange={onChange}
      formElementRef={formElementRef}
      initialResource={initialSubscription}
      createUrl={resourceUrl}
      afterCreatedFn={afterCreatedFn}
      setCustomValid={setCustomValid}
      nameProps={{ prefix: prefix }}
    >
      <ResourceForm.FormField
        label={t('subscriptions.create.labels.sink')}
        messageStrip={sinkMessageStrip}
        tooltipContent={t('subscriptions.tooltips.sink')}
      />

      <ResourceForm.FormField
        required
        label={t('subscriptions.create.labels.service-name')}
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
        placeholder={t('subscriptions.create.placeholders.service-name')}
        options={(services || []).map(i => ({
          key: i.metadata.name,
          text: i.metadata.name,
        }))}
        error={servicesError}
        loading={servicesLoading}
        tooltipContent={t('subscriptions.tooltips.service-name')}
        disabled={!!serviceName}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('subscriptions.create.labels.application-name')}
        tooltipContent={t('subscriptions.tooltips.application-name')}
        value={firstEventTypeValues.appName}
        input={({ value }) => (
          <ComboboxInput
            id="application-name-combobox"
            ariaLabel={t('common.messages.choose', {
              value: t('subscriptions.create.labels.application-name'),
            })}
            showAllEntries
            searchFullString
            selectionType="manual"
            required
            compact
            placeholder={t(
              'subscriptions.create.placeholders.application-name',
            )}
            options={(applications || []).map(i => ({
              key: i.metadata.name,
              text: i.metadata.name,
            }))}
            selectedKey={value}
            typedValue={value}
            onSelect={e => {
              handleEventTypeValuesChange({ appName: e.target.value });
            }}
          />
        )}
        error={applicationsError}
        loading={applicationsLoading}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('subscriptions.create.labels.event-name')}
        setValue={eventName => handleEventTypeValuesChange({ eventName })}
        value={firstEventTypeValues.eventName}
        input={Inputs.Text}
        placeholder={t('subscriptions.create.placeholders.event-name')}
        inputInfo={t('subscriptions.tooltips.event-name')}
        validate={() => {
          const { eventName } = firstEventTypeValues;
          const tokens = eventName.split('.');
          return tokens.every(t => t) && tokens.filter(Boolean).length >= 2;
        }}
        validateMessage={() => {
          const { eventName } = firstEventTypeValues;
          if (!eventName) {
            return t('subscriptions.errors.event-name-required');
          }
          const tokens = eventName.split('.');
          if (tokens.filter(Boolean).length < 2 || !tokens.every(t => t)) {
            return t('subscriptions.errors.event-name-segments');
          }
          return '';
        }}
      />

      <ResourceForm.FormField
        simple
        required
        label={t('subscriptions.create.labels.event-version')}
        tooltipContent={t('subscriptions.tooltips.event-version')}
        value={firstEventTypeValues.version}
        input={({ value }) => (
          <ComboboxInput
            id="event-version-combobox"
            ariaLabel={t('common.messages.choose', {
              value: t('subscriptions.create.labels.event-version'),
            })}
            showAllEntries
            searchFullString
            selectionType="manual"
            required
            compact
            placeholder={t('subscriptions.create.placeholders.event-version')}
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
        className="break-word"
        simple
        label={t('subscriptions.create.labels.event-type')}
        messageStrip={eventTypeMessageStrip}
        tooltipContent={t('subscriptions.tooltips.event-type-simple')}
      />
      <FiltersSection
        advanced
        onChange={onChange}
        resource={subscription}
        setResource={setSubscription}
      />
      {(jp.value(subscription, '$.spec.filter.filters') || []).length === 0 ? (
        <MessageStrip
          advanced
          type="warning"
          className="fd-margin-top--sm fd-margin-bottom--sm"
        >
          {t('subscriptions.errors.empty-event-types')}
        </MessageStrip>
      ) : null}
    </ResourceForm>
  );
};
SubscriptionCreate.allowEdit = true;
