import React from 'react';
import { isAfter, isSameDay, formatDate, parseISO, subDays } from 'date-fns';

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

export const ReadableCreationTimestamp = ({ timestamp }) => {
  const now = new Date();
  const createdAt = new Date(timestamp);
  const hourDifference = getHourDifference(createdAt, now);

  if (hourDifference > -1)
    // is there at least one hour difference?
    return rtf.format(Math.ceil(getMinuteDifference(createdAt, now)), 'minute');
  else return rtf.format(Math.ceil(getHourDifference(createdAt, now)), 'hour');
};
