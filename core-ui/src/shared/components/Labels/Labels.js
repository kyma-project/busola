import React from 'react';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import './Labels.scss';

const SHORTENING_TRESHOLD = 60;

export const Labels = ({ labels, shortenLongLabels = false }) => {
  if (!labels || Object.keys(labels).length === 0) {
    return <span>{EMPTY_TEXT_PLACEHOLDER}</span>;
  }
  const separatedLabels = [];
  /* eslint-disable no-unused-vars */
  for (const key in labels) {
    separatedLabels.push(`${key}=${labels[key]}`);
  }

  const shortenLabel = label => label.slice(0, SHORTENING_TRESHOLD) + '...';

  /* eslint-enable no-unused-vars */
  return (
    <div className="labels">
      {separatedLabels.map((label, id) => (
        <span
          aria-label={label}
          className="fd-token fd-token--readonly"
          key={id}
          title={
            (shortenLongLabels &&
              label.length > SHORTENING_TRESHOLD &&
              label) ||
            undefined
          }
        >
          <span className="fd-token__text fd-has-font-size-small">
            {shortenLongLabels && label.length > SHORTENING_TRESHOLD
              ? shortenLabel(label)
              : label}
          </span>
        </span>
      ))}
    </div>
  );
};
