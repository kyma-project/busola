import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Button } from 'fundamental-react';
import { isEqual } from 'lodash';

import { YamlUpload } from './YamlUpload';
import { YamlResourcesList } from './YamlResourcesList';
import { useUploadResources } from './useUploadResources';

import './YamlUploadDialog.scss';

export function YamlUploadDialog({ show, onCancel }) {
  const [resourcesData, setResourcesData] = useState(undefined);
  const oldYaml = useRef(undefined);
  const { fetchResources } = useUploadResources(
    resourcesData,
    setResourcesData,
  );

  useEffect(() => {
    if (show) {
      setResourcesData(undefined);
    }
  }, [show]);

  const updateYamlContent = yaml => {
    if (isEqual(yaml?.sort(), oldYaml?.current?.sort())) return;
    if (!yaml) {
      setResourcesData(null);
      return;
    }
    const nonEmptyResources = yaml?.filter(resource => resource !== null);
    const resourcesWithStatus = nonEmptyResources?.map(y => ({
      value: y,
      status: '',
      message: '',
    }));
    setResourcesData(resourcesWithStatus);
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
          resourcesData={resourcesData?.value}
          setResourcesData={updateYamlContent}
        />
        <YamlResourcesList
          resourcesData={resourcesData}
          setResourcesData={updateYamlContent}
        />
      </div>
    </Dialog>
  );
}
