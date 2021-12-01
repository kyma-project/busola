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
      return 'informative';

    case 'READY':
    case 'RUNNING':
    case 'SUCCESS':
    case 'SUCCEEDED':
      return 'positive';

    case 'UNKNOWN':
    case 'WARNING':
      return 'critical';

    case 'FAILED':
    case 'ERROR':
    case 'FAILURE':
      return 'negative';

    default:
      return undefined;
  }
};

const translate = (i18n, arrayOfVariableNames, fallbackValue) => {
  if (!i18n) return fallbackValue;

  const { t } = useTranslation(null, { i18n });
  return t([...arrayOfVariableNames, 'statuses.common.fallback'], {
    fallback: fallbackValue,
  }).toUpperCase();
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
  const i18nFullVariableName = `${resourceKind
    .toString()
    .toLowerCase()}.statuses.${value
    .toString()
    .toLowerCase()
    .replace(/\s/g, '-')}`;
  const tooltipVariableName = `${resourceKind
    .toString()
    .toLowerCase()}.tooltips.${value
    .toString()
    .toLowerCase()
    .replace(/\s/g, '-')}`;
  const commonTooltipVariableName = `commons.tooltips.${value
    .toString()
    .toLowerCase()
    .replace(/\s/g, '-')}`;
  const fallbackValue = value.toString().toUpperCase();

  const classes = classNames(
    'status-badge',
    {
      ['status-badge--' + type]: type,
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
      style={{ whiteSpace: 'nowrap' }}
    >
      {translate(
        i18n,
        [i18nFullVariableName, 'common.statuses.fallback'],
        fallbackValue,
      )}
    </ObjectStatus>
  );
  let content = translate(
    i18n,
    [
      tooltipVariableName,
      commonTooltipVariableName,
      i18nFullVariableName,
      'commons.tooltips.fallback',
    ],
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
