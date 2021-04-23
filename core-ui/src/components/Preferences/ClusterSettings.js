import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'react-shared';
import { LayoutPanel, FormInput, FormLabel, Button } from 'fundamental-react';

export default function ClusterSettings() {
  const clusterSettings = useMicrofrontendContext().cluster;
  const [server, setServer] = React.useState(clusterSettings?.server);
  const [ca, setCa] = React.useState(
    clusterSettings['certificate-authority-data'],
  );

  const updateApiUrl = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.updateClusterParams',
      server,
      'certificate-authority-data': ca,
    });
  };

  return (
    <LayoutPanel className="fd-has-margin-tiny fd-margin-top--sm">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Cluster Setttings" />
        <LayoutPanel.Actions>
          <Button option="emphasized" onClick={updateApiUrl}>
            Update configuration
          </Button>
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <FormLabel>Kubernetes API Url</FormLabel>
        <FormInput
          type="url"
          defaultValue={server}
          placeholder="Kubernetes API Url"
          onChange={e => setServer(e.target.value)}
        />
        <FormLabel className="fd-margin-top--sm">
          Certificate authority data
        </FormLabel>
        <FormInput
          type="url"
          defaultValue={ca}
          placeholder="Certificate authority data"
          onChange={e => setCa(e.target.value)}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
