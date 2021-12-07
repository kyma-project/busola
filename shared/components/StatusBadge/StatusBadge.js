import React from 'react';
import { useTranslation } from 'react-i18next';

import { ObjectStatus } from 'fundamental-react';
import PropTypes from 'prop-types';
import './StatusBadge.scss';
import classNames from 'classnames';
import { Tooltip } from '../Tooltip/Tooltip';

const resolveType = status => {
  if (typeof status !== 'string') {
    console.warn(
      `'autoResolveType' prop requires 'children' prop to be a string.`,
    );
    return undefined;
  }

  switch (status.toUpperCase()) {
    case 'INITIAL':
    case 'PENDING':
      return 'informative';

    case 'READY':
    case 'RUNNING':
    case 'SUCCESS':
    case 'SUCCEEDED':
    case 'OK':
      return 'positive';

    case 'UNKNOWN':
    case 'WARNING':
      return 'critical';

    case 'FAILED':
    case 'ERROR':
    case 'FAILURE':
    case 'INVALID':
      return 'negative';

    default:
      return undefined;
  }
};

const translate = (i18n, arrayOfVariableNames, fallbackValue) => {
  console.log('arrayOfVariableNames', arrayOfVariableNames);
  if (!i18n) return fallbackValue;
  const { t } = useTranslation(null, { i18n });
  return t([...arrayOfVariableNames, 'fallback'], {
    fallback: fallbackValue,
  }).toString();
};

const prepareTranslationPath = (resourceKind, value, type) => {
  return `${resourceKind.toString().toLowerCase()}.${type}.${value
    .toString()
    .toLowerCase()
    .replace(/\s/g, '-')}`;
};
const TYPE_FALLBACK = new Map([
  ['success', 'positive'],
  ['warning', 'critical'],
  ['error', 'negative'],
  ['info', 'informative'],
]);
export const StatusBadge = ({
  additionalContent,
  tooltipContent, // deprecated
  type,
  resourceKind = 'common',
  children: value = '',
  autoResolveType = false,
  tooltipProps = {},
  noTooltip = false,
  className,
  i18n,
}) => {
  if (autoResolveType) type = resolveType(value);
  else
    for (const key of TYPE_FALLBACK.keys()) {
      if (type === key) type = TYPE_FALLBACK.get(key);
    }
  const i18nFullVariableName = prepareTranslationPath(
    resourceKind,
    value,
    'statuses',
  );
  const commonStatusVariableName = prepareTranslationPath(
    'common',
    value,
    'statuses',
  );
  const tooltipVariableName = prepareTranslationPath(
    resourceKind,
    value,
    'tooltips',
  );
  const commonTooltipVariableName = prepareTranslationPath(
    'common',
    value,
    'tooltips',
  );
  const fallbackValue = value.toString();
  const classes = classNames(
    'status-badge',
    {
      'has-tooltip': !noTooltip,
    },
    className,
  );

  const badgeElement = (
    <ObjectStatus
      ariaLabel="Status"
      role="status"
      inverted
      status={type}
      className={classes}
      data-testid={noTooltip ? 'no-tooltip' : 'has-tooltip'}
      style={{ whiteSpace: 'nowrap' }}
    >
      {translate(
        i18n,
        [i18nFullVariableName, commonStatusVariableName],
        fallbackValue,
      )}
    </ObjectStatus>
  );

  let content = translate(
    i18n,
    [tooltipVariableName, commonTooltipVariableName, i18nFullVariableName],
    fallbackValue,
  );
  if (additionalContent) {
    content = `${content} ${additionalContent}`;
  }
  const statusElement = noTooltip ? (
    badgeElement
  ) : (
    <Tooltip content={content} {...tooltipProps}>
      {badgeElement}
    </Tooltip>
  );

  // tooltipContent is DEPREATED. Remove after migration of all resources
  // return (statusElement);
  return tooltipContent ? (
    <Tooltip content={tooltipContent} {...tooltipProps}>
      {badgeElement}
    </Tooltip>
  ) : (
    statusElement
  );
};

StatusBadge.propTypes = {
  additionalContent: PropTypes.node,
  tooltipContent: PropTypes.node,
  type: PropTypes.oneOf([
    'positive',
    'negative',
    'critical',
    'informative',
    'success',
    'error',
    'warning',
    'info',
  ]),
  autoResolveType: PropTypes.bool,
  noTooltip: PropTypes.bool,
  resourceKind: PropTypes.string,
  tooltipProps: PropTypes.object,
  i18n: PropTypes.object,
  className: PropTypes.string,
};
