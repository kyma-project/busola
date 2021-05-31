import React from 'react';
import jsyaml from 'js-yaml';
import './KubeconfigTextArea.scss';

import { Button } from 'fundamental-react';

export function KubeconfigTextArea({ onSubmit, setShowError }) {
  const [kubeconfigText, setKubeconfigText] = React.useState('');

  const onClick = async () => {
    setShowError(false);
    try {
      const parsed = jsyaml.load(kubeconfigText);
      if (!parsed || typeof parsed !== 'object') {
        throw Error('Kubeconfig must be an object.');
      }
      await onSubmit(parsed);
    } catch (e) {
      setShowError(true);
      console.warn(e);
    }
  };

  return (
    <div className="kubeconfig-text-area">
      <textarea
        id="textarea-kubeconfig"
        placeholder="Paste your config"
        onChange={e => setKubeconfigText(e.target.value)}
      ></textarea>
      <Button option="emphasized" onClick={onClick} disabled={!kubeconfigText}>
        Apply kubeconfig
      </Button>
    </div>
  );
}
