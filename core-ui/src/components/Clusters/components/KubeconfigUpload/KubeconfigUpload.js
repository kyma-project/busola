import React from 'react';
import { MessageStrip, Tab, TabGroup } from 'fundamental-react';
import { KubeconfigFileUpload } from './KubeconfigFileUpload';
import { KubeconfigTextArea } from './KubeconfigTextArea/KubeconfigTextArea';
import jsyaml from 'js-yaml';

export function KubeconfigUpload({
  handleKubeconfigAdded,
  kubeconfigFromParams,
}) {
  const [tabIndex, setTabIndex] = React.useState(0);
  const [showParseError, setShowParseError] = React.useState(false);
  const [kubeconfigs, setKubeconfigs] = React.useState({
    text: jsyaml.dump(kubeconfigFromParams),
  });

  React.useEffect(() => {
    // select second tab, the one with text field
    if (!!kubeconfigFromParams) setTabIndex(1);
  }, [kubeconfigFromParams]);

  const parseKubeconfig = text => {
    try {
      const parsed = jsyaml.load(text);
      if (!parsed || typeof parsed !== 'object') {
        throw Error('Kubeconfig must be an object.');
      }
      return parsed;
    } catch (e) {
      console.warn(e);
      return null;
    }
  };

  const onKubeconfigTextAdded = source => text => {
    const kubeconfig = parseKubeconfig(text);
    setShowParseError(!kubeconfig);
    setKubeconfigs({ ...kubeconfigs, [source]: kubeconfig });
    handleKubeconfigAdded(kubeconfig);
  };

  return (
    <>
      <TabGroup
        selectedIndex={tabIndex}
        onTabClick={(_, index) => {
          setShowParseError(false);
          handleKubeconfigAdded(kubeconfigs[index === 0 ? 'upload' : 'text']);
        }}
        className="fd-margin-bottom--sm"
      >
        <Tab title="Upload">
          <KubeconfigFileUpload
            onKubeconfigTextAdded={onKubeconfigTextAdded('upload')}
          />
        </Tab>
        <Tab title="Paste">
          <KubeconfigTextArea
            onKubeconfigTextAdded={onKubeconfigTextAdded('text')}
            kubeconfigFromParams={kubeconfigFromParams}
          />
        </Tab>
      </TabGroup>

      {showParseError && (
        <MessageStrip
          aria-label="invalid-kubeconfig"
          className="fd-margin-top--sm"
          type="error"
        >
          Error reading kubeconfig
        </MessageStrip>
      )}
    </>
  );
}
