import { Panel, Title, Toolbar, ToolbarSpacer } from '@ui5/webcomponents-react';

export const UI5Panel = ({ fixed = true, title, headerActions, content }) => {
  return (
    <Panel
      fixed={fixed}
      className="fd-margin--md"
      header={
        <Toolbar>
          <Title level="H5">{title}</Title>
          {headerActions && (
            <>
              <ToolbarSpacer />
              {headerActions}
            </>
          )}
        </Toolbar>
      }
    >
      {content}
    </Panel>
  );
};
