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

  if (!filteredResources) {
    return null;
  } else {
    if (showResourcesToUpload()) {
      return (
        <ul>
          You will create {filteredResources.length || 0} resources:
          {filteredResources?.map(r => (
            <li key={`${r?.value?.kind}-${r?.value?.metadata?.name}`}>
              - {r?.value?.kind} {r?.value?.metadata?.name}
            </li>
          ))}
        </ul>
      );
    } else {
      return (
        <div>
          <div id="upload-progress-bar-container">
            <div
              id="upload-progress-bar"
              style={{ width: `${getPercentage()}%` }}
            >
              <span id="upload-progress-bar-label">{getLabel()}</span>
            </div>
          </div>
          <ul>
            {filteredResources.map(r => (
              <li key={`${r?.value?.kind}-${r?.value?.name}`}>
                <div>
                  <Icon
                    className={`status status-${getIcon(r?.status)}`}
                    glyph={getIcon(r?.status)}
                    ariaLabel="status"
                  />
                  {r?.value?.kind} {r?.value?.metadata?.name} - {r?.status}
                </div>
                <p>{r?.message}</p>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }
}
