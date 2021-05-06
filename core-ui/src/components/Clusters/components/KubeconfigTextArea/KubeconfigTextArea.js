import React from 'react';
import jsyaml from 'js-yaml';
import './KubeconfigTextArea.scss';

import { Button } from 'fundamental-react';

export function KubeconfigTextArea({ onSubmit, setShowError }) {
  const [kubeconfigText, setKubeconfigText] = React.useState('');

  const onClick = async () => {
    setShowError(false);
    try {
      onSubmit(jsyaml.load(kubeconfigText));
    } catch (e) {
      setShowError(true);
      console.warn(e);
    }
  };

  return (
    <div className="kubeconfig-text-area">
      <textarea
        placeholder="Paste your config"
        onChange={e => setKubeconfigText(e.target.value)}
      ></textarea>
      <Button option="emphasized" onClick={onClick} disabled={!kubeconfigText}>
        Apply kubeconfig
      </Button>
    </div>
  );
}
