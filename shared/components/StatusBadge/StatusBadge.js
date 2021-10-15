import React from 'react';
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

const TYPE_FALLBACK = new Map([
  ['success', 'positive'],
  ['warning', 'critical'],
  ['error', 'negative'],
  ['info', 'informative'],
]);
export const StatusBadge = ({
  tooltipContent,
  type,
  children: value = '',
  autoResolveType = false,
  tooltipProps = {},
  className,
}) => {
  if (autoResolveType) type = resolveType(value);
  else
    for (const key of TYPE_FALLBACK.keys()) {
      if (type === key) type = TYPE_FALLBACK.get(key);
    }

  const classes = classNames(
    'status-badge',
    {
      ['status-badge--' + type]: type,
      'has-tooltip': tooltipContent,
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
      {value.toString().toUpperCase()}
    </ObjectStatus>
  );

  return tooltipContent ? (
    <Tooltip content={tooltipContent} {...tooltipProps}>
      {badgeElement}
    </Tooltip>
  ) : (
    badgeElement
  );
};

StatusBadge.propTypes = {
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
  tooltipProps: PropTypes.object,
  className: PropTypes.string,
};
