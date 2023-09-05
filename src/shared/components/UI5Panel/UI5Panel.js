import { Panel, Title, Toolbar, ToolbarSpacer } from '@ui5/webcomponents-react';
import classNames from 'classnames';

export const UI5Panel = ({
  fixed = true,
  icon = undefined,
  title,
  headerActions,
  key = 'UI5Panel',
  disableMargin = false,
  className = '',
  children,
}) => {
  const panelClassNames = classNames({
    'fd-margin--md': !disableMargin,
  });

  return (
    <Panel
      fixed={fixed}
      key={key}
      className={`${panelClassNames} ${className}`}
      header={
        <Toolbar
          style={{ height: '100%', paddingTop: '10px', paddingBottom: '10px' }}
        >
          {icon && icon}
          {typeof title === 'string' ? (
            <Title level="H5">{title}</Title>
          ) : (
            title
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
