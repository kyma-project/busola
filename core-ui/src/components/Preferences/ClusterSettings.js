import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'react-shared';
import { Panel, FormInput, FormLabel, Button } from 'fundamental-react';

export default function ClusterSettings() {
  const clusterSettings = useMicrofrontendContext().cluster;
  const [server, setServer] = React.useState(clusterSettings.server);
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
    <Panel className="fd-has-margin-tiny fd-has-margin-top-small">
      <Panel.Header>
        <Panel.Head title="Cluster Setttings" />
        <Panel.Actions>
          <Button option="emphasized" onClick={updateApiUrl}>
            Update configuration
          </Button>
        </Panel.Actions>
      </Panel.Header>
      <Panel.Body>
        <FormLabel>Kubernetes API Url</FormLabel>
        <FormInput
          type="url"
          defaultValue={server}
          placeholder="Kubernetes API Url"
          onChange={e => setServer(e.target.value)}
        />
        <FormLabel className="fd-has-margin-top-s">
          Certificate authority data
        </FormLabel>
        <FormInput
          type="url"
          defaultValue={ca}
          placeholder="Certificate authority data"
          onChange={e => setCa(e.target.value)}
        />
      </Panel.Body>
    </Panel>
  );
}
