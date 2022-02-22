import React from 'react';
import { Icon } from 'fundamental-react';
import {
  STATE_ERROR,
  STATE_WAITING,
  STATE_UPDATED,
  STATE_CREATED,
} from './useUploadResources';
import { useTranslation } from 'react-i18next';
import './YamlResourcesList.scss';

export function YamlResourcesList({ resourcesData }) {
  const { t } = useTranslation();
  const filteredResources = resourcesData?.filter(
    resource => resource !== null,
  );

  const showResourcesToUpload = () => {
    return !filteredResources?.filter(r => r.status)?.length;
  };

  const getLabel = () => {
    return `${filteredResources?.filter(
      r => r.status && r.status !== STATE_WAITING,
    )?.length || 0}/${filteredResources?.length || 0}`;
  };

  const getPercentage = () => {
    return (
      ((filteredResources?.filter(r => r.status && r.status !== STATE_WAITING)
        ?.length || 0) /
        (filteredResources?.length || 0)) *
      100
    );
  };

  const getIcon = status => {
    switch (status) {
      case STATE_WAITING:
        return 'pending';
      case STATE_UPDATED:
      case STATE_CREATED:
        return 'message-success';
      case STATE_ERROR:
        return 'error';
      default:
        return 'question-mark';
    }
  };

  const getStatus = status => {
    return t(`upload-yaml.statuses.${status.toLowerCase()}`);
  };

  if (!filteredResources) {
    return null;
  } else {
    if (showResourcesToUpload()) {
      return (
        <ul className="fd-margin-top--md">
          {t(
            filteredResources.length === 1
              ? 'upload-yaml.you-will-create_one'
              : 'upload-yaml.you-will-create_other',
            {
              count: filteredResources.length || 0,
            },
          )}
          {filteredResources?.map(r => (
            <li
              key={`${r?.value?.kind}-${r?.value?.metadata?.name}`}
              className="fd-margin-begin--sm"
              style={{ listStyle: 'disc' }}
            >
              {r?.value?.kind} {r?.value?.metadata?.name}
            </li>
          ))}
        </ul>
      );
    } else {
      return (
        <div className="fd-margin-top--md">
          <div id="upload-progress-bar-container">
            <div
              id="upload-progress-bar"
              style={{ width: `${getPercentage()}%` }}
            ></div>
            <div id="upload-progress-bar-label">{getLabel()}</div>
          </div>
          <ul className="fd-margin-top--tiny">
            {filteredResources.map(r => (
              <li key={`${r?.value?.kind}-${r?.value?.name}`}>
                <Icon
                  className={`status status-${getIcon(r?.status)}`}
                  glyph={getIcon(r?.status)}
                  ariaLabel="status"
                />
                {r?.value?.kind} {r?.value?.metadata?.name} -{' '}
                {getStatus(r?.status)}
                <p>{r?.message}</p>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }
}
