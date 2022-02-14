import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Button } from 'fundamental-react';
import { isEqual } from 'lodash';

import { YamlUpload } from './YamlUpload';
import { YamlResourcesList } from './YamlResourcesList';
import { useUploadResources } from './useUploadResources';

import './YamlUploadDialog.scss';

export function YamlUploadDialog({ show, onCancel }) {
  const [resourcesData, setResourcesData] = useState(undefined);
  const [resourcesWithStatuses, setResourcesWithStatuses] = useState(undefined);
  const oldYaml = useRef(undefined);
  const { fetchResources } = useUploadResources(
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
        <Button onClick={() => onCancel()} option="transparent">
          Cancel
        </Button>,
      ]}
    >
      <div className="yaml-modal-content">
        <YamlUpload
          resourcesData={resourcesData}
          setResourcesData={updateYamlContent}
        />
        <YamlResourcesList
          resourcesData={resourcesWithStatuses}
          setResourcesData={setResourcesWithStatuses}
        />
      </div>
    </Dialog>
  );
}
