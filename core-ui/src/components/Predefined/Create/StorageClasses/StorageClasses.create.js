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
import { createStorageClassTemplate } from './templates';

const StorageClassesCreate = ({
  onChange,
  formElementRef,
  resource: initialStorageClass,
  resourceUrl,
}) => {
  const { t } = useTranslation();

  const [storageclass, setStorageClass] = useState(
    cloneDeep(initialStorageClass) || createStorageClassTemplate(),
  );

  const notification = useNotification();

  const afterCreatedFn = async defaultAfterCreatedFn => {
    // if (!name) {
    //   defaultAfterCreatedFn();
    // } else {
    //when serviceName is given,display notification and don't redirect
    notification.notifySuccess({
      content: t(
        initialStorageClass
          ? 'common.create-form.messages.patch-success'
          : 'common.create-form.messages.create-success',
        {
          resourceType: t(`storage-classes.name_singular`),
        },
      ),
    });
    // }
  };

  return (
    <ResourceForm
      pluralKind="storageclass"
      singularName={t('storage-classes.name_singular')}
      resource={storageclass}
      setResource={setStorageClass}
      onChange={onChange}
      formElementRef={formElementRef}
      initialResource={initialStorageClass}
      createUrl={resourceUrl}
      afterCreatedFn={afterCreatedFn}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('storage-classes.name_singular')}
        setValue={name => {
          jp.value(storageclass, '$.metadata.name', name);
          setStorageClass({ ...storageclass });
        }}
        readOnly={!!initialStorageClass}
      />

      {/* <ResourceForm.FormField
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
      />
      {(jp.value(subscription, '$.spec.filter.filters') || []).length === 0 ? (
        <MessageStrip
          advanced
          type="warning"
          className="fd-margin-top--sm fd-margin-bottom--sm"
        >
          {t('subscription.errors.empty-event-types')}
        </MessageStrip>
      ) : null} */}
    </ResourceForm>
  );
};
export { StorageClassesCreate };
