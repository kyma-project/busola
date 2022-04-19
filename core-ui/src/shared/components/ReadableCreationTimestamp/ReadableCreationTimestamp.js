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

export const ReadableCreationTimestamp = ({ timestamp }) => {
  if (!timestamp) return null;

  const now = new Date();
  const createdAt = new Date(timestamp);

  const dayDifference = getDayDifference(createdAt, now);
  if (dayDifference < -1) return rtf.format(Math.ceil(dayDifference), 'day');

  const hourDifference = getHourDifference(createdAt, now);
  if (hourDifference < -1) return rtf.format(Math.ceil(hourDifference), 'hour');

  return rtf.format(Math.ceil(getMinuteDifference(createdAt, now)), 'minute');
};
