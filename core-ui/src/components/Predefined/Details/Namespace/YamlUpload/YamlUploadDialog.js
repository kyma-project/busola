import React, { useEffect, useState, useRef } from 'react';
import { Dialog, Button } from 'fundamental-react';
import { isEqual } from 'lodash';

import { YamlUpload } from './YamlUpload';
import { YamlResourcesList } from './YamlResourcesList';
import { useUploadResources } from './useUploadResources';

import './YamlUploadDialog.scss';
import { useTranslation } from 'react-i18next';

export function YamlUploadDialog({ show, onCancel }) {
  const { t } = useTranslation();
  const [resourcesData, setResourcesData] = useState();
  const [resourcesWithStatuses, setResourcesWithStatuses] = useState();
  const oldYaml = useRef();
  const fetchResources = useUploadResources(
    resourcesWithStatuses,
    setResourcesWithStatuses,
  );

  useEffect(() => {
    if (show) {
      setResourcesData(null);
      setResourcesWithStatuses(null);
    }
  }, [show]);

  const updateYamlContent = yaml => {
    if (isEqual(yaml?.sort(), oldYaml?.current?.sort())) return;
    setResourcesData(yaml);
    const nonEmptyResources = yaml?.filter(resource => resource !== null);
    const resourcesWithStatus = nonEmptyResources?.map(value => ({
      value,
      status: '',
      message: '',
    }));
    setResourcesWithStatuses(resourcesWithStatus);
    oldYaml.current = yaml;
  };

  return (
    <Dialog
      show={show}
      title={t('upload-yaml.title')}
      actions={[
        <Button
          onClick={fetchResources}
          disabled={!resourcesWithStatuses?.length}
          option="emphasized"
        >
          {t('common.buttons.submit')}
        </Button>,
        <Button onClick={onCancel} option="transparent">
          {t('common.buttons.cancel')}
        </Button>,
      ]}
      className="yaml-upload-modal"
    >
      <YamlUpload
        resourcesData={resourcesData}
        setResourcesData={updateYamlContent}
      />
      <div className="fd-margin-begin--tiny">
        {t('upload-yaml.info')}
        <YamlResourcesList
          resourcesData={resourcesWithStatuses}
          setResourcesData={setResourcesWithStatuses}
        />
      </div>
    </Dialog>
  );
}
