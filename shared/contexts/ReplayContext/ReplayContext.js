import React, { createContext, useState, useContext } from 'react';
import jsyaml from 'js-yaml';
import _ from 'lodash';
import classnames from 'classnames';
import './ReplayContext.scss';
import { ResultPanel } from './ResultPanel';

function cleanupResource(resource) {
  resource = _.clone(resource, true);

  delete resource.status;
  delete resource.metadata.managedFields;
  delete resource.metadata.creationTimestamp;
  delete resource.metadata.generation;
  delete resource.metadata.resourceVersion;
  delete resource.metadata.uid;

  return resource;
}

export const ReplayContext = createContext({});

export function ReplayContextProvider({ children }) {
  const [isRecording, setRecording] = useState(false);
  const [resources, setResources] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState('');

  const switchRecording = () => {
    if (isRecording) {
      setRecording(false);
      if (resources.length) {
        const yamls = resources
          .map(cleanupResource)
          .map(jsyaml.dump)
          .join('---\n');
        setResult(yamls);
        setShowResult(true);
      }
    } else {
      setRecording(true);
      setResources([]);
    }
  };

  const register = ({ method, result }) => {
    const allowedMethods = ['POST', 'PATCH'];

    if (isRecording && allowedMethods.includes(method)) {
      resources.push(result);
    }
  };

  const parentClassName = classnames('replay__parent', {
    'replay__parent--recording': isRecording,
  });

  const buttonClassName = classnames('replay__button', {
    'replay__button--recording': isRecording,
  });

  return (
    <ReplayContext.Provider value={{ isRecording, register }}>
      <div className={parentClassName}>
        <ResultPanel
          close={() => setShowResult(false)}
          result={result}
          showResult={showResult}
        />
        <button className={buttonClassName} onClick={switchRecording} />
        {children}
      </div>
    </ReplayContext.Provider>
  );
}

export function useRecorder() {
  return useContext(ReplayContext);
}
