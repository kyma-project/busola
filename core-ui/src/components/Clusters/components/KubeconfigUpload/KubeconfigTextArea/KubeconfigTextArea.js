import React, { useRef } from 'react';
import jsyaml from 'js-yaml';
import './KubeconfigTextArea.scss';
import { useWebcomponents } from 'react-shared';

export function KubeconfigTextArea({
  onKubeconfigTextAdded,
  kubeconfigFromParams,
  textAreaRef,
}) {
  const [value, setValue] = React.useState('');
  const submitButtonRef = useRef();

  const handleInputChange = event => {
    const text = event.target.value;
    if (text) {
      submitButtonRef.current.disabled = false;
    } else {
      submitButtonRef.current.disabled = true;
    }
    setValue(text);
  };

  useWebcomponents(textAreaRef, 'input', handleInputChange);
  useWebcomponents(submitButtonRef, 'click', () =>
    onKubeconfigTextAdded(value),
  );

  // it would be better to use just the defaultValue, but during the first render
  // kkFromParams is empty - even though it will be set in the next render
  // const textAreaRef = React.useRef();
  React.useEffect(() => {
    if (!!kubeconfigFromParams) {
      setValue(jsyaml.dump(kubeconfigFromParams));
    }
  }, [kubeconfigFromParams]);

  return (
    <div className="kubeconfig-text-area">
      <ui5-textarea
        ref={textAreaRef}
        id="textarea-kubeconfig"
        placeholder="Paste your config"
      ></ui5-textarea>
      <ui5-button disabled ref={submitButtonRef}>
        Apply kubeconfig
      </ui5-button>
    </div>
  );
}
