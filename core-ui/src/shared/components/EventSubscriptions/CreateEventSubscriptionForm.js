import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormItem,
  FormLabel,
  FormInput,
  FormFieldset,
  Icon,
} from 'fundamental-react';
import { InputWithPrefix, useGet } from 'react-shared';
import './CreateEventSubscriptionForm.scss';

const DEFAULT_EVENT_TYPE_PREFIX = 'sap.kyma.custom.lololo.';

export default function CreateEventSubscriptionForm({
  formElementRef,
  onSubmit = _ => void 0,
  onChange,
}) {
  const { t } = useTranslation();

  const { data: configMap } = useGet(
    '/api/v1/namespaces/kyma-system/configmaps/eventing',
    {
      pollingInterval: 3000000,
    },
  );
  let eventTypePrefix =
    configMap?.data?.eventTypePrefix || DEFAULT_EVENT_TYPE_PREFIX;
  eventTypePrefix = eventTypePrefix.endsWith('.')
    ? eventTypePrefix
    : eventTypePrefix + '.';

  const eventAppInput = useRef(),
    eventTypeInput = useRef(),
    eventVersionInput = useRef();

  const inputFields = [eventAppInput, eventTypeInput, eventVersionInput];

  const eventTypeFinalInput = useRef();

  async function handleSubmit(e) {
    e.preventDefault();
    onSubmit(eventTypePrefix + eventTypeFinalInput.current.value);
  }

  async function calculateEventType() {
    if (!inputFields.every(i => i.current?.value)) return; //cannot calculate value; TODO: inform user that all three fields must be valid to generate eventType

    const newValue = inputFields.map(f => f.current.value).join('.');
    eventTypeFinalInput.current.value = newValue;
  }

  async function handleEventTypeManualChange(e) {
    inputFields.forEach(i => {
      if (i.current) i.current.value = '';
    });
  }

  return (
    <form
      ref={formElementRef}
      onSubmit={handleSubmit}
      onChange={onChange}
      className="create-event-subscription-form"
      noValidate
    >
      <FormFieldset>
        <h2 className="fd-has-type-4">
          <Icon
            size="m"
            className="icon"
            glyph="process"
            ariaLabel={t('event-subscription.create.labels.calculate-from-cmp')}
          />
          {t('event-subscription.create.labels.calculate-event-type')}
        </h2>

        <FormItem>
          <FormLabel
            htmlFor="event_app"
            required
            className="fd-has-display-block"
          >
            {t('event-subscription.create.labels.application-name')}
          </FormLabel>
          <FormInput
            ref={eventAppInput}
            onChange={calculateEventType}
            placeholder="Name of the application which is the source of the event"
            id="event_app"
          />
        </FormItem>
        <FormItem>
          <FormLabel
            htmlFor="event_type"
            required
            className="fd-has-display-block"
          >
            {t('event-subscription.create.labels.event-name')}
          </FormLabel>
          <FormInput
            onChange={calculateEventType}
            ref={eventTypeInput}
            placeholder={t('event-subscription.create.labels.event-name')}
            id="event_type"
          />
        </FormItem>
        <FormItem>
          <FormLabel
            htmlFor="event_version"
            required
            className="fd-has-display-block"
          >
            {t('event-subscription.create.labels.event-version')}
          </FormLabel>
          <FormInput
            onChange={calculateEventType}
            ref={eventVersionInput}
            placeholder={t('event-subscription.create.labels.event-version')}
            id="event_version"
            defaultValue="v1"
          />
        </FormItem>
      </FormFieldset>
      <div className="create-event-subscription-form--divider"></div>
      <FormFieldset>
        <h2 className="fd-has-type-4">
          <Icon
            size="m"
            className="icon"
            glyph="edit"
            ariaLabel="Fill manually"
          />
          {t('event-subscription.create.labels.enter-event-type')}
        </h2>
        <FormItem>
          <FormLabel
            htmlFor="final_value"
            required
            className="fd-has-display-block"
          >
            {t('event-subscription.create.labels.event-type')}
          </FormLabel>
          <InputWithPrefix
            prefix={eventTypePrefix}
            _ref={eventTypeFinalInput}
            onChange={handleEventTypeManualChange}
            required
            placeholder="The Event Type value used to create the subscription"
            id="final_value"
          />
        </FormItem>
      </FormFieldset>
    </form>
  );
}
