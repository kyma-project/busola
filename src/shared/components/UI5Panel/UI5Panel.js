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
import { useEffect } from 'react';

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
  stickyHeader = false,
  headerTop = '0',
}) => {
  useEffect(() => {
    if (headerTop !== '0')
      setTimeout(() => {
        const stickyHeader = document
          .querySelector('ui5-panel')
          ?.shadowRoot?.querySelector('.ui5-panel-root')
          ?.querySelector(
            '.ui5-panel-heading-wrapper.ui5-panel-heading-wrapper-sticky',
          );

        if (stickyHeader) {
          stickyHeader.style['top'] = headerTop;
        }
      });
  });
  return (
    <Panel
      fixed={fixed}
      key={keyComponent}
      className={`${className} bsl-panel-header card-shadow`}
      style={style ? style : !disableMargin ? spacing.sapUiSmallMargin : null}
      stickyHeader={stickyHeader}
      header={
        <Toolbar
          style={{
            height: '100%',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            paddingLeft: modeActions ? 0 : '1rem',
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
          {headerActions && modeActions && (
            <>
              <div className="header-actions invisible">{headerActions}</div>
              <ToolbarSpacer />
              {modeActions}
              <ToolbarSpacer className="toolbar-spacer" />
              <div className="header-actions">{headerActions}</div>
            </>
          )}
          {headerActions && !modeActions && (
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
