import React from 'react';
import jsyaml from 'js-yaml';
import './KubeconfigTextArea.scss';

export function KubeconfigTextArea({
  onKubeconfigTextAdded,
  kubeconfigFromParams,
}) {
  // it would be better to use just the defaultValue, but during the first render
  // kkFromParams is empty - even though it will be set in the next render
  const textAreaRef = React.useRef();
  React.useEffect(() => {
    if (!!kubeconfigFromParams) {
      textAreaRef.current.value = jsyaml.dump(kubeconfigFromParams);
    }
  }, [kubeconfigFromParams]);

  return (
    <div className="kubeconfig-text-area">
      <textarea
        ref={textAreaRef}
        id="textarea-kubeconfig"
        placeholder="Paste your config"
        onChange={e => onKubeconfigTextAdded(e.target.value)}
      ></textarea>
    </div>
  );
}
