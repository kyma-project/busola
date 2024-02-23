import {
  Panel,
  Text,
  Title,
  Toolbar,
  ToolbarSeparator,
  ToolbarSpacer,
} from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';

export const UI5Panel = ({
  fixed = true,
  icon = undefined,
  title,
  headerActions,
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
      className={`${className}`}
      style={style ? style : !disableMargin ? spacing.sapUiSmallMargin : null}
      header={
        <Toolbar
          style={{
            height: '100%',
            paddingTop: '10px',
            paddingBottom: '10px',
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
