import { forwardRef, ReactNode, useContext, useState } from 'react';
import { Card, CardHeader, Title } from '@ui5/webcomponents-react';
import { Toolbar } from '@ui5/webcomponents-react-compat/dist/components/Toolbar/index.js';
import { ToolbarSpacer } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSpacer/index.js';
import { NestedContainerContext } from './NestedContainerContext';
import { HintButton } from '../HintButton/HintButton';
import './UI5Card.scss';

type UI5CardProps = {
  title: string | ReactNode;
  headerActions?: ReactNode;
  modeActions?: ReactNode;
  keyComponent?: string;
  className?: string;
  children?: ReactNode;
  testid?: string;
  accessibleName?: string;
  role?: string;
  description?: string;
};

export const UI5Card = forwardRef<HTMLElement, UI5CardProps>(
  (
    {
      title,
      headerActions,
      modeActions = null,
      keyComponent = 'UI5Card',
      className = '',
      children,
      testid,
      accessibleName,
      role,
      description = 'test description',
    },
    ref,
  ) => {
    const isNested = useContext(NestedContainerContext);
    const shouldHaveMargin = isNested;
    const [showDescription, setShowDescription] = useState(false);

    const toolbarHeader = (
      <Toolbar
        toolbarStyle="Clear"
        className={`bsl-card-toolbar${
          modeActions ? ' bsl-card-toolbar--with-mode-actions' : ''
        }`}
      >
        {typeof title === 'string' ? (
          <Title level="H6" size="H6">
            {title}
          </Title>
        ) : (
          title
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
        {description && (
          <HintButton
            setShowTitleDescription={setShowDescription}
            showTitleDescription={showDescription}
            description={description}
          />
        )}
        {headerActions && !modeActions && (
          <>
            <ToolbarSpacer />
            {headerActions}
          </>
        )}
      </Toolbar>
    );

    const normalHeader = (
      <CardHeader titleText={typeof title === 'string' ? title : undefined} />
    );

    return (
      <NestedContainerContext.Provider value={true}>
        <Card
          ref={ref as any}
          role={role}
          data-testid={testid}
          key={keyComponent}
          className={`${className} ${shouldHaveMargin ? 'sap-margin-small bsl-card--nested' : ''}`}
          accessibleName={accessibleName}
          header={
            headerActions || description || typeof title !== 'string'
              ? toolbarHeader
              : normalHeader
          }
        >
          {children}
        </Card>
      </NestedContainerContext.Provider>
    );
  },
);

UI5Card.displayName = 'UI5Card';
