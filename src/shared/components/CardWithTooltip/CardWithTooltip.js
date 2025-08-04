import { Card, CardHeader, Icon } from '@ui5/webcomponents-react';
import PropTypes from 'prop-types';

import { Tooltip } from 'shared/components/Tooltip/Tooltip';

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
          accessibleName={title}
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
      <div className="sap-margin-small">{children}</div>
    </Card>
  );
};

CardWithTooltip.propTypes = {
  title: PropTypes.string,
  tooltip: PropTypes.object,
  children: PropTypes.node,
  icon: PropTypes.string,
};
