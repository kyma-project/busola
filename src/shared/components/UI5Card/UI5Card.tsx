import { ReactNode, useContext } from 'react';
import { Card, CardHeader, Title } from '@ui5/webcomponents-react';
import { Toolbar } from '@ui5/webcomponents-react-compat/dist/components/Toolbar/index.js';
import { ToolbarSpacer } from '@ui5/webcomponents-react-compat/dist/components/ToolbarSpacer/index.js';
import { NestedContainerContext } from './NestedContainerContext';
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
};

export const UI5Card = ({
  title,
  headerActions,
  modeActions = null,
  keyComponent = 'UI5Card',
  className = '',
  children,
  testid,
  accessibleName,
  role,
}: UI5CardProps) => {
  const isNested = useContext(NestedContainerContext);
  const shouldHaveMargin = isNested;

  const useNativeHeader =
    !modeActions && !headerActions && typeof title === 'string';

  const nativeHeader = (
    <CardHeader titleText={typeof title === 'string' ? title : undefined} />
  );

  const toolbarHeader = (
    <Toolbar
      className={`bsl-card-toolbar${
        modeActions ? ' bsl-card-toolbar--with-mode-actions' : ''
      }`}
    >
      {typeof title === 'string' ? <Title level="H4">{title}</Title> : title}
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
  );

  return (
    <NestedContainerContext.Provider value={true}>
      <Card
        role={role}
        data-testid={testid}
        key={keyComponent}
        className={`${className} ${shouldHaveMargin ? 'sap-margin-small' : ''}`}
        accessibleName={accessibleName}
        header={useNativeHeader ? nativeHeader : toolbarHeader}
      >
        {children}
      </Card>
    </NestedContainerContext.Provider>
  );
};
