import { Card, CardHeader, Icon } from '@ui5/webcomponents-react';
import PropTypes from 'prop-types';

import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { spacing } from '@ui5/webcomponents-react-base';

const TooltipWrapper = ({ tooltipProps, children }) => {
  if (tooltipProps?.content) {
    return <Tooltip {...tooltipProps}>{children}</Tooltip>;
  }
  return children;
};

export const CardWithTooltip = ({ title, tooltip, children, icon }) => {
  return (
    <Card
      header={
        <CardHeader
          titleText={title}
          action={
            <div slot="action">
              <TooltipWrapper tooltipProps={tooltip}>
                <Icon name={icon} />
              </TooltipWrapper>
            </div>
          }
        />
      }
    >
      <div style={{ ...spacing.sapUiSmallMargin }}>{children}</div>
    </Card>
  );
};

CardWithTooltip.propTypes = {
  title: PropTypes.string,
  tooltip: PropTypes.object,
};
