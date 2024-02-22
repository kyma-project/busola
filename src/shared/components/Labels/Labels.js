import React from 'react';
import classNames from 'classnames';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Badge, Label } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';
import './Labels.scss';
import { useTranslation } from 'react-i18next';

const SHORTENING_TRESHOLD = 50;

export const Labels = ({
  labels,
  className = '',
  shortenLongLabels = true,
  style = null,
  displayLabelForLabels = false,
}) => {
  const { t } = useTranslation();
  if (!labels || Object.keys(labels).length === 0) {
    return (
      <>
        {displayLabelForLabels ? (
          <Label showColon={true} style={spacing.sapUiTinyMarginBottom}>
            {t('common.headers.labels')}
          </Label>
        ) : null}
        <div>{EMPTY_TEXT_PLACEHOLDER}</div>
      </>
    );
  }
  const separatedLabels = [];
  for (const key in labels) {
    separatedLabels.push(`${key}=${labels[key]}`);
  }

  const shortenLabel = label => label.slice(0, SHORTENING_TRESHOLD) + '...';

  return (
    <>
      {displayLabelForLabels ? (
        <Label
          showColon={true}
          style={spacing.sapUiTinyMarginBottom}
          className="bsl-has-color-status-4"
        >
          {t('common.headers.labels')}
        </Label>
      ) : null}
      <div className={classNames('labels', className)} style={style}>
        {separatedLabels.map((label, id) => (
          <Badge
            aria-label={label}
            key={id}
            colorScheme="10"
            style={{
              ...spacing.sapUiTinyMarginEnd,
              ...spacing.sapUiTinyMarginBottom,
            }}
          >
            {shortenLongLabels && label.length > SHORTENING_TRESHOLD
              ? shortenLabel(label)
              : label}
          </Badge>
        ))}
      </div>
    </>
  );
};
