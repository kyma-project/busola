import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Tag, Label } from '@ui5/webcomponents-react';

import './Labels.scss';

const SHORTENING_TRESHOLD = 50;

export const Labels = ({
  labels,
  className = '',
  shortenLongLabels = true,
  style = null,
  displayLabelForLabels = false,
  disableMarginBottom = false,
  hideIcon = true,
}) => {
  const { t } = useTranslation();
  if (!labels || Object.keys(labels).length === 0) {
    return (
      <>
        {displayLabelForLabels ? (
          <Label showColon={true} className="sap-margin-bottom-tiny">
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
          className="bsl-has-color-status-4 sap-margin-bottom-tiny"
        >
          {t('common.headers.labels')}
        </Label>
      ) : null}
      <div className={classNames('labels', className)} style={style}>
        {separatedLabels.map((label, id) => (
          <Tag
            aria-label={label}
            key={id}
            colorScheme="10"
            design="Set2"
            className={`sap-margin-end-tiny ${
              disableMarginBottom ? '' : 'sap-margin-bottom-tiny'
            }`}
            hideStateIcon={hideIcon}
          >
            {shortenLongLabels && label.length > SHORTENING_TRESHOLD
              ? shortenLabel(label)
              : label}
          </Tag>
        ))}
      </div>
    </>
  );
};
