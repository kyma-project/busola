import React, { useEffect, useRef } from 'react';
import jsyaml from 'js-yaml';
import { Button } from 'fundamental-react';
import './KubeconfigTextArea.scss';

export function KubeconfigTextArea({
  onKubeconfigTextAdded,
  kubeconfigFromParams,
  textAreaRef,
}) {
  const [value, setValue] = React.useState('');
  const submitButtonRef = useRef();

  useEffect(() => {
    textAreaRef.current.addEventListener('input', event => {
      const text = event.target.value;
      console.log(text);
      if (text) {
        submitButtonRef.current.disabled = false;
      } else {
        submitButtonRef.current.disabled = true;
      }
      setValue(text);
    });
    submitButtonRef.current.addEventListener('click', async _ => {
      onKubeconfigTextAdded(value);
    });

    return () => {
      textAreaRef.current.removeEventListener('input', () => {});
      submitButtonRef.current.removeEventListener('click', () => {});
    };
  }, []);

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
