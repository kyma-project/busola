import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER } from '../../constants/constants';

export const Labels = labels => {
  labels = labels.labels;
  if (!labels || Object.keys(labels).length === 0) {
    return <span>{EMPTY_TEXT_PLACEHOLDER}</span>;
  }
  const separatedLabels = [];
  /* eslint-disable no-unused-vars */
  for (const key in labels) {
    separatedLabels.push(`${key}=${labels[key]}`);
  }

  /* eslint-enable no-unused-vars */
  return separatedLabels.map((label, id) => (
    <span
      aria-label={label}
      className="fd-token fd-token--readonly "
      key={id}
      style={{ marginBottom: '4px', marginRight: '4px' }}
    >
      <span className="fd-token__text fd-has-font-size-small">{label}</span>
    </span>
  ));
};
