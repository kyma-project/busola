import React, { useRef } from 'react';
import jsyaml from 'js-yaml';
import './KubeconfigTextArea.scss';
import { useWebcomponents } from 'react-shared';

export function KubeconfigTextArea({
  onKubeconfigTextAdded,
  kubeconfigFromParams,
}) {
  const [value, setValue] = React.useState('');
  const applyKubeconfigTextAreaRef = useRef();
  const applyKubeconfigButtonRef = useRef();

  const handleInputChange = event => {
    const text = event.target.value;
    applyKubeconfigButtonRef.current.disabled = !text;
    setValue(text);
  };

  useWebcomponents(applyKubeconfigTextAreaRef, 'input', handleInputChange);
  useWebcomponents(applyKubeconfigButtonRef, 'click', () =>
    onKubeconfigTextAdded(value),
  );

  // it would be better to use just the defaultValue, but during the first render
  // kkFromParams is empty - even though it will be set in the next render
  React.useEffect(() => {
    if (!!kubeconfigFromParams) {
      setValue(jsyaml.dump(kubeconfigFromParams));
    }
  }, [kubeconfigFromParams]);

  return (
    <div className="kubeconfig-text-area">
      <ui5-textarea
        ref={applyKubeconfigTextAreaRef}
        id="textarea-kubeconfig"
        placeholder="Paste your config"
      ></ui5-textarea>
      <ui5-button disabled ref={applyKubeconfigButtonRef}>
        Apply kubeconfig
      </ui5-button>
    </div>
  );
}
