import React from 'react';
import classNames from 'classnames';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Token } from '@ui5/webcomponents-react';
import './Labels.scss';

const SHORTENING_TRESHOLD = 60;

export const Labels = ({
  labels,
  className = '',
  shortenLongLabels = false,
}) => {
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
    <div className={classNames('labels', className)}>
      {separatedLabels.map((label, id) => (
        <Token
          aria-label={label}
          key={id}
          className="token fd-margin-end--tiny"
          readOnly
          text={label}
          title={
            (shortenLongLabels &&
              label.length > SHORTENING_TRESHOLD &&
              label) ||
            undefined
          }
        />
      ))}
    </div>
  );
};
