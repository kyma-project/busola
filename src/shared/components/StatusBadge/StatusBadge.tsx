import { I18nInterfaces } from 'types';
import { useTranslation } from 'react-i18next';
import { ObjectStatus } from '@ui5/webcomponents-react';
import classNames from 'classnames';
import { createTranslationTextWithLinks } from '../../helpers/linkExtractor';

import './StatusBadge.scss';
import { PopoverBadge } from '../PopoverBadge/PopoverBadge';
import { TFunction } from 'i18next';

const resolveType = (status: string | any) => {
  if (typeof status !== 'string') {
    console.warn(
      `'autoResolveType' prop requires 'children' prop to be a string.`,
    );
    return undefined;
  }

  switch (status) {
    case 'Initial':
    case 'Pending':
    case 'Available':
    case 'Released':
      return 'Information';

    case 'Ready':
    case 'Bound':
    case 'Running':
    case 'Success':
    case 'Succeeded':
    case 'Ok':
      return 'Positive';

    case 'Unknown':
    case 'Warning':
      return 'Critical';

    case 'Failed':
    case 'Error':
    case 'Failure':
    case 'Invalid':
      return 'Negative';

    default:
      return 'None';
  }
};

const translate = (
  i18n: I18nInterfaces,
  t: TFunction,
  arrayOfVariableNames: string | string[],
  fallbackValue: string,
): string => {
  return i18n.exists(arrayOfVariableNames)
    ? t(arrayOfVariableNames)
    : fallbackValue;
};

const prepareTranslationPath = (
  resourceKind: string,
  value: string,
  type: string,
): string => {
  return `${resourceKind.toString().toLowerCase()}.${type}.${value
    .toString()
    .toLowerCase()
    .replace(/\s/g, '-')}`;
};

const TYPE_FALLBACK = new Map([
  ['positive', 'Positive'],
  ['critical', 'Critical'],
  ['negative', 'Negative'],
  ['info', 'Information'],
]);

type StatusBadgeProps = {
  additionalContent?: React.ReactNode;
  tooltipContent?: React.ReactNode; // deprecated
  type: 'Information' | 'Positive' | 'Negative' | 'Critical' | 'None';
  resourceKind?: string;
  children: string | any;
  autoResolveType?: boolean;
  noTooltip?: boolean;
  className?: string;
  disableLinkDetection?: boolean;
};

export const StatusBadge = ({
  additionalContent,
  tooltipContent, // deprecated
  type = 'Information',
  resourceKind = 'common',
  children: value = '',
  autoResolveType = false,
  noTooltip = false,
  className,
  disableLinkDetection = false,
}: StatusBadgeProps) => {
  const { t, i18n } = useTranslation();
  if (autoResolveType) type = resolveType(value) as StatusBadgeProps['type'];
  else type = (TYPE_FALLBACK.get(type) || type) as StatusBadgeProps['type'];

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
  const badgeContent = translate(
    i18n,
    t,
    [i18nFullVariableName, commonStatusVariableName],
    fallbackValue,
  );
  let content = translate(
    i18n,
    t,
    [tooltipVariableName, commonTooltipVariableName, i18nFullVariableName],
    fallbackValue,
  );

  if (!additionalContent && content === badgeContent) noTooltip = true;

  const classes = classNames(
    'status-badge',
    {
      'has-tooltip': !noTooltip,
    },
    className,
  );

  if (additionalContent) {
    // Remove the dot at the end of the sentence if we add a colon afterwards
    if (content?.endsWith('.')) content = content?.slice(0, -1);
    content = `${content}: ${additionalContent}`;
  }

  let tooltipContentWithLink = tooltipContent;

  if (!disableLinkDetection && typeof tooltipContent === 'string') {
    const result = createTranslationTextWithLinks(tooltipContent, t, i18n);
    tooltipContentWithLink = result;
  }

  if (tooltipContent) {
    return (
      <PopoverBadge
        tooltipContent={tooltipContentWithLink}
        type={type}
        className={classes}
      >
        {badgeContent}
      </PopoverBadge>
    );
  } else if (noTooltip) {
    return (
      <ObjectStatus
        aria-label={badgeContent}
        role="status"
        inverted
        state={type}
        className={classes}
        data-testid="no-tooltip"
        showDefaultIcon={type !== 'Information'}
      >
        {badgeContent}
      </ObjectStatus>
    );
  } else {
    return (
      <PopoverBadge tooltipContent={content} type={type} className={classes}>
        {badgeContent}
      </PopoverBadge>
    );
  }
};
