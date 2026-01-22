import { createContext, ReactNode, useContext, useEffect } from 'react';
import { Panel, Text, Title } from '@ui5/webcomponents-react';
import { Toolbar } from '@ui5/webcomponents-react-compat/dist/components/Toolbar/index.js';
import { ToolbarSpacer } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSpacer/index.js';
import { ToolbarSeparator } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSeparator/index.js';
import './UI5Panel.scss';

const NestedPanelContext = createContext(false);

type UI5PanelProps = {
  fixed?: boolean;
  icon?: string;
  title: string | ReactNode;
  headerActions?: ReactNode;
  modeActions?: ReactNode;
  keyComponent?: string;
  className?: string;
  children: ReactNode;
  description?: string;
  stickyHeader?: boolean;
  headerTop?: string;
  testid?: string;
  accessibleName?: string;
};

export const UI5Panel = ({
  fixed = true,
  icon = undefined,
  title,
  headerActions,
  modeActions = null,
  keyComponent = 'UI5Panel',
  className = '',
  children,
  description = '',
  stickyHeader = false,
  headerTop = '0',
  testid,
  accessibleName,
}: UI5PanelProps) => {
  const isNested = useContext(NestedPanelContext);
  // top-level panels have no margin, nested panels have margin
  const shouldHaveMargin = isNested;

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
    <NestedPanelContext.Provider value={true}>
      <Panel
        data-testid={testid}
        fixed={fixed}
        key={keyComponent}
        className={`${className} bsl-panel-header card-shadow ${
          shouldHaveMargin ? 'sap-margin-small' : ''
        }`}
        stickyHeader={stickyHeader}
        accessibleName={accessibleName}
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
              <Title level="H4">{title}</Title>
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
    </NestedPanelContext.Provider>
  );
};
