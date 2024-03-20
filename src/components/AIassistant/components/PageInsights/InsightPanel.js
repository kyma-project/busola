import {
  ObjectStatus,
  Panel,
  Text,
  Title,
  Toolbar,
  ToolbarSpacer,
} from '@ui5/webcomponents-react';
import { useState } from 'react';
import './InsightPanel.scss';

export default function InsightPanel({ resourceType, resourceName, status }) {
  const [open, setOpen] = useState(true);
  const toggle = () => {
    setOpen(!open);
  };

  return (
    <Panel
      collapsed={!open}
      onToggle={toggle}
      noAnimation
      className="insight-panel"
      header={
        <Toolbar active toolbarStyle="Clear" onClick={toggle}>
          <Title level="H5" className="toolbar-title">
            {resourceType + ' ' + resourceName}
          </Title>
          {status && (
            <>
              <ToolbarSpacer />
              <ObjectStatus state={status} showDefaultIcon />
            </>
          )}
        </Toolbar>
      }
    >
      <Text>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
        sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
        rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
        ipsum dolor sit amet.
      </Text>
    </Panel>
  );
}
