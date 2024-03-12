import {
  Panel,
  Text,
  Title,
  Toolbar,
  ToolbarSeparator,
  ToolbarSpacer,
} from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';
import './UI5Panel.scss';

export const UI5Panel = ({
  fixed = true,
  icon = undefined,
  title,
  headerActions,
  modeActions = null,
  keyComponent = 'UI5Panel',
  disableMargin = false,
  className = '',
  children,
  description = '',
  style = null,
}) => {
  return (
    <Panel
      fixed={fixed}
      key={keyComponent}
      className={`${className} bsl-panel-header`}
      style={style ? style : !disableMargin ? spacing.sapUiSmallMargin : null}
      header={
        <Toolbar
          style={{
            height: '100%',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            paddingLeft: '1rem',
          }}
        >
          {icon && icon}
          {typeof title === 'string' ? (
            <Title level="H5">{title}</Title>
          ) : (
            title
          )}
          {description && (
            <>
              <ToolbarSeparator />
              <Text>{description}</Text>
            </>
          )}
          {modeActions && modeActions}
          {headerActions && (
            <>
              <ToolbarSpacer />
              {headerActions}
            </>
          )}
        </Toolbar>
      }
    >
      {children}
    </Panel>
  );
};
