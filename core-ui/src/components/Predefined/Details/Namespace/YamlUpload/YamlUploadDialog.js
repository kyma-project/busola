import React, { useEffect, useState } from 'react';
import { Dialog, Button } from 'fundamental-react';

import { YamlUpload } from './YamlUpload';
import { YamlResourcesList } from './YamlResourcesList';
import { useUploadResources } from './useUploadResources';

import './YamlUploadDialog.scss';

export function YamlUploadDialog({ show, onCancel }) {
  const [yamlContent, setYamlContent] = useState(undefined);
  const { fetchResources } = useUploadResources(yamlContent);

  useEffect(() => {
    if (show) {
      setYamlContent(undefined);
    }
  }, [show]);

  const updateYamlContent = yaml => {
    if (!yaml) {
      setYamlContent(null);
      return;
    }
    const yamlWithStatus = yaml.map(y => ({ value: y, status: '' }));
    setYamlContent(yamlWithStatus);
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
          yamlContent={yamlContent?.value}
          setYamlContent={updateYamlContent}
        />
        <YamlResourcesList
          yamlContent={yamlContent}
          setYamlContent={updateYamlContent}
        />
      </div>
    </Dialog>
  );
}
