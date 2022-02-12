import React from 'react';
import { Icon } from 'fundamental-react';

import './YamlResourcesList.scss';

export function YamlResourcesList({ resourcesData }) {
  const filteredResources = resourcesData?.filter(
    resource => resource !== null,
  );

  const showResourcesToUpload = () => {
    return !filteredResources?.filter(r => r.status)?.length;
  };

  const showResourcesUploaded = () => {
    return !showResourcesToUpload();
  };

  const getLabel = () => {
    return `${filteredResources?.filter(r => r.status && r.status !== 'Waiting')
      ?.length || 0}/${filteredResources?.length || 0}`;
  };

  const getPercentage = () => {
    return (
      ((filteredResources?.filter(r => r.status && r.status !== 'Waiting')
        ?.length || 0) /
        (filteredResources?.length || 0)) *
      100
    );
  };

  const getIcon = status => {
    switch (status) {
      case 'Waiting':
        return 'pending';
      case 'Updated':
      case 'Created':
        return 'message-success';
      case 'Error':
        return 'error';
      default:
        return 'question-mark';
    }
  };
  return (
    <div className="yaml-modal-resources">
      {showResourcesToUpload() && (
        <div>
          You will create {filteredResources?.length || 0} resources:
          {filteredResources?.map(r => (
            <p key={`${r?.value?.kind}-${r?.value?.name}`}>
              - {r?.value?.kind} {r?.value?.name}
            </p>
          ))}
        </div>
      )}
      {showResourcesUploaded() && (
        <div>
          <div id="upload-progress-bar-container">
            <div
              id="upload-progress-bar"
              style={{ width: `${getPercentage()}%` }}
            >
              <span id="upload-progress-bar-label">{getLabel()}</span>
            </div>
          </div>
          {filteredResources?.map(r => (
            <>
              <p key={`${r?.value?.kind}-${r?.value?.name}`}>
                <Icon
                  className={`status status-${getIcon(r?.status)}`}
                  glyph={getIcon(r?.status)}
                />
                {r?.value?.kind} {r?.value?.name} - {r?.status}
              </p>
              <p ey={`${r?.value?.kind}-${r?.value?.name}-message`}>
                {r?.message}
              </p>
            </>
          ))}
        </div>
      )}
    </div>
  );
}
