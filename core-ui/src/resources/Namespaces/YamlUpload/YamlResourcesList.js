import React from 'react';
import { Icon } from 'fundamental-react';
import { Switch } from 'shared/ResourceForm/inputs';
import { useTranslation } from 'react-i18next';

import {
  STATE_ERROR,
  STATE_WAITING,
  STATE_UPDATED,
  STATE_CREATED,
} from './useUploadResources';
import { FilteredResourcesDetails } from './FilteredResourcesDetails/FilteredResourcesDetails';
import './YamlResourcesList.scss';

export function YamlResourcesList({
  resourcesData,
  isValidationOn,
  handleResourceValidation,
}) {
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
        <>
          <div
            className="fd-display-flex fd-justify-between fd-align-center fd-margin--tiny"
            style={{ height: '20px' }}
          >
            <p>
              {t(
                filteredResources.length === 1
                  ? 'upload-yaml.you-will-create_one'
                  : 'upload-yaml.you-will-create_other',
                {
                  count: filteredResources.length || 0,
                },
              )}
            </p>
            <div className="validate-resources">
              <p>{t('upload-yaml.labels.validate-resources')}</p>
              <Switch
                onChange={handleResourceValidation}
                checked={isValidationOn}
              />
            </div>
          </div>
          <FilteredResourcesDetails
            filteredResources={filteredResources}
            isValidationOn={isValidationOn}
          />
        </>
      );
    } else {
      return (
        <>
          <div id="upload-progress-bar-container">
            <div
              id="upload-progress-bar"
              style={{ width: `${getPercentage()}%` }}
            />
            <div id="upload-progress-bar-label">{getLabel()}</div>
          </div>
          <ul className="fd-margin-top--tiny">
            {filteredResources.map(r => (
              <li key={`${r?.value?.kind}-${r?.value?.metadata?.name}`}>
                <Icon
                  className={`status status-${getIcon(r?.status)}`}
                  glyph={getIcon(r?.status)}
                  ariaLabel="status"
                />
                {String(r?.value?.kind)} {String(r?.value?.metadata?.name)} -{' '}
                {getStatus(r?.status)}
                <p>{r?.message}</p>
              </li>
            ))}
          </ul>
        </>
      );
    }
  }
}
