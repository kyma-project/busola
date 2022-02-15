import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Button } from 'fundamental-react';
import { isEqual } from 'lodash';

import { YamlUpload } from './YamlUpload';
import { YamlResourcesList } from './YamlResourcesList';
import { useUploadResources } from './useUploadResources';

import './YamlUploadDialog.scss';

function YamlUploadHelp() {
  return "You can upload multiple resources, separated in YAML by '---'. If resource already exists, it will be updated, otherwise a new one will be created. In case the namespace is not given, the 'default' will be used.";
}

export function YamlUploadDialog({ show, onCancel }) {
  const [resourcesData, setResourcesData] = useState();
  const [resourcesWithStatuses, setResourcesWithStatuses] = useState();
  const oldYaml = useRef();
  const fetchResources = useUploadResources(
    resourcesWithStatuses,
    setResourcesWithStatuses,
  );

  useEffect(() => {
    if (show) {
      setResourcesData(undefined);
    }
  }, [show]);

  const updateYamlContent = yaml => {
    if (isEqual(yaml?.sort(), oldYaml?.current?.sort())) return;
    setResourcesData(yaml);
    const nonEmptyResources = yaml?.filter(resource => resource !== null);
    const resourcesWithStatus = nonEmptyResources?.map(y => ({
      value: y,
      status: '',
      message: '',
    }));
    setResourcesWithStatuses(resourcesWithStatus);
    oldYaml.current = yaml;
  };

  return (
    <Dialog
      show={show}
      title={'Upload Yaml'}
      actions={[
        <Button onClick={fetchResources} option="emphasized">
          Submit
        </Button>,
        <Button onClick={onCancel} option="transparent">
          Cancel
        </Button>,
      ]}
      className="yaml-upload-modal"
    >
      <YamlUpload
        resourcesData={resourcesData}
        setResourcesData={updateYamlContent}
      />
      <div className="fd-margin-begin--tiny">
        <YamlUploadHelp />
        <YamlResourcesList
          resourcesData={resourcesWithStatuses}
          setResourcesData={setResourcesWithStatuses}
        />
      </div>
    </Dialog>
  );
}
