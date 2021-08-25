import React from 'react';
import jsyaml from 'js-yaml';
import { Button } from 'fundamental-react';
import './KubeconfigTextArea.scss';

export function KubeconfigTextArea({
  onKubeconfigTextAdded,
  kubeconfigFromParams,
}) {
  const [value, setValue] = React.useState('');

  // it would be better to use just the defaultValue, but during the first render
  // kkFromParams is empty - even though it will be set in the next render
  const textAreaRef = React.useRef();
  React.useEffect(() => {
    if (!!kubeconfigFromParams) {
      setValue(jsyaml.dump(kubeconfigFromParams));
    }
  }, [kubeconfigFromParams]);

  return (
    <div className="kubeconfig-text-area">
      <textarea
        ref={textAreaRef}
        id="textarea-kubeconfig"
        placeholder="Paste your config"
        value={value}
        onChange={e => setValue(e.target.value)}
      ></textarea>
      <Button
        option="emphasized"
        className="fd-margin-top--sm"
        onClick={() => onKubeconfigTextAdded(value)}
        disabled={!value}
      >
        Apply kubeconfig
      </Button>
    </div>
  );
}
