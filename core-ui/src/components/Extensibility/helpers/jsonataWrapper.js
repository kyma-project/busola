import jsonata from 'jsonata';
import { isEqual } from 'lodash';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function jsonataWrapper(expression) {
  const exp = jsonata(expression);

  exp.registerFunction('matchByLabelSelector', (pod, labels) => {
    if (!pod.metadata?.labels || !labels) return false;

    const podLabels = Object?.entries(pod.metadata?.labels);
    const resourceLabels = Object?.entries(labels);
    return resourceLabels.every(resLabel =>
      podLabels.some(podLabel => isEqual(resLabel, podLabel)),
    );
  });

  exp.registerFunction(
    'matchEvents',
    (resource, resourceKind, resourceName) => {
      return (
        resource?.involvedObject?.name === resourceName &&
        resource?.involvedObject?.kind === resourceKind
      );
    },
  );

  exp.registerFunction('compareStrings', (first, second) => {
    return first?.localeCompare(second) ?? 1;
  });

  exp.registerFunction('readableTimestamp', timestamp => {
    if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;

    function getDayDifference(time1, time2) {
      return (time1 - time2) / (24 * 60 * 60 * 1000);
    }

    function getHourDifference(time1, time2) {
      return (time1 - time2) / (60 * 60 * 1000);
    }

    function getMinuteDifference(time1, time2) {
      return (time1 - time2) / (60 * 1000);
    }

    const rtf = new Intl.RelativeTimeFormat('en', {
      localeMatcher: 'best fit', // other values: "lookup"
      numeric: 'auto', // other values: "auto"
      style: 'long', // other values: "short" or "narrow"
    });

    const now = new Date();
    const createdAt = new Date(timestamp);
    const dayDifference = getDayDifference(createdAt, now);
    if (dayDifference < -1) return rtf.format(Math.ceil(dayDifference), 'day');

    const hourDifference = getHourDifference(createdAt, now);
    if (hourDifference < -1)
      return rtf.format(Math.ceil(hourDifference), 'hour');

    return rtf.format(Math.ceil(getMinuteDifference(createdAt, now)), 'minute');
  });

  return exp;
}
