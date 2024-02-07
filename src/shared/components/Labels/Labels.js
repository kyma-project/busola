import React from 'react';
import classNames from 'classnames';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Token, Label } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';
import './Labels.scss';

const SHORTENING_TRESHOLD = 60;

export const Labels = ({
  labels,
  className = '',
  shortenLongLabels = false,
  style = null,
  displayLabelForLabels = false,
}) => {
  if (!labels || Object.keys(labels).length === 0) {
    return <span>{EMPTY_TEXT_PLACEHOLDER}</span>;
  }
  const separatedLabels = [];
  for (const key in labels) {
    separatedLabels.push(`${key}=${labels[key]}`);
  }

  return (
    <>
      {displayLabelForLabels ? <Label showColon={true}>Labels</Label> : null}
      <div className={classNames('labels', className)} style={style}>
        {separatedLabels.map((label, id) => (
          <Token
            aria-label={label}
            key={id}
            className="token"
            style={spacing.sapUiTinyMarginEnd}
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
    </>
  );
};
