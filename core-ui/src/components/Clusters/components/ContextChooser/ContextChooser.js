import React, { useRef } from 'react';
import { useWebcomponents } from 'react-shared';
import './ContextChooser.scss';

export function ContextChooser({ kubeconfig, setContextName }) {
  const contextSelectRef = useRef();
  useWebcomponents(contextSelectRef, 'change', setContextName);

  return (
    <div className="context-chooser">
      <ui5-label> Context:</ui5-label>
      <ui5-select class="select" ref={contextSelectRef}>
        {kubeconfig?.contexts?.map(context => {
          const currentContext = context.name === kubeconfig['current-context'];
          return currentContext ? (
            <ui5-option key={context.name} selected>
              {context.name}
            </ui5-option>
          ) : (
            <ui5-option key={context.name}>{context.name}</ui5-option>
          );
        })}
      </ui5-select>
    </div>
  );
}
