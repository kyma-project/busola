import { ReactNode, useEffect } from 'react';
import { Panel, Text, Title } from '@ui5/webcomponents-react';
import { Toolbar } from '@ui5/webcomponents-react-compat/dist/components/Toolbar/index.js';
import { ToolbarSpacer } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSpacer/index.js';
import { ToolbarSeparator } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSeparator/index.js';
import './UI5Panel.scss';

type UI5PanelProps = {
  fixed?: boolean;
  icon?: string;
  title: string | ReactNode;
  headerActions?: ReactNode;
  modeActions?: ReactNode;
  keyComponent?: string;
  disableMargin?: boolean;
  className?: string;
  children: ReactNode;
  description?: string;
  stickyHeader?: boolean;
  headerTop?: string;
};

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
  stickyHeader = false,
  headerTop = '0',
}: UI5PanelProps) => {
  useEffect(() => {
    if (headerTop !== '0')
      setTimeout(() => {
        const stickyHeader = document
          .querySelector('.resource-form--panel')
          ?.shadowRoot?.querySelector('.ui5-panel-root')
          ?.querySelector(
            '.ui5-panel-heading-wrapper.ui5-panel-heading-wrapper-sticky',
          ) as HTMLElement;

        if (stickyHeader) {
          stickyHeader.style['top'] = headerTop;
        }
      });
  });
  return (
    <Panel
      fixed={fixed}
      key={keyComponent}
      className={`${className} bsl-panel-header card-shadow ${
        !disableMargin ? 'sap-margin-small' : ''
      }`}
      stickyHeader={stickyHeader}
      header={
        <Toolbar
          className="toolbar"
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
              <div className="header-actions invisible" aria-hidden="true">
                {headerActions}
              </div>
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
