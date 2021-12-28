import * as jp from 'jsonpath';

export const getServiceName = sink => {
  if (typeof sink !== 'string') return '';

  const startIndex = sink?.lastIndexOf('/') + 1;
  const nextDot = sink?.indexOf('.');
  return sink?.substring(startIndex, nextDot);
};

export const validateEventSubscription = (eventSubscription, appName) => {
  const serviceName = getServiceName(
    jp.value(eventSubscription, '$.spec.sink'),
  );

  return serviceName && appName;
};

export const getEventFilter = value => {
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
export const spreadEventType = (eventType, eventTypePrefix) => {
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
