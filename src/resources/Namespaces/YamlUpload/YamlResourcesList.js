import React from 'react';
import { Icon, Switch } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import {
  getExtendedValidateResourceState,
  validateResourcesState,
} from 'state/preferences/validateResourcesAtom';

import {
  STATE_ERROR,
  STATE_WAITING,
  STATE_UPDATED,
  STATE_CREATED,
} from './useUploadResources';
import { FilteredResourcesDetails } from './FilteredResourcesDetails/FilteredResourcesDetails';

import './YamlResourcesList.scss';
import { spacing } from '@ui5/webcomponents-react-base';

export function YamlResourcesList({ resourcesData }) {
  const { t } = useTranslation();
  const [validateResources, setValidateResources] = useRecoilState(
    validateResourcesState,
  );
  const {
    isEnabled,
    choosePolicies,
    policies: selectedPolicies = [],
  } = getExtendedValidateResourceState(validateResources);
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
            className="bsl-display-flex bsl-justify-between bsl-align-center"
            style={spacing.sapUiTinyMargin}
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
                onChange={() =>
                  setValidateResources({
                    isEnabled: !isEnabled,
                    choosePolicies,
                    policies: selectedPolicies,
                  })
                }
                checked={isEnabled}
              />
            </div>
          </div>
          <FilteredResourcesDetails filteredResources={filteredResources} />
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
          <ul style={spacing.sapUiTinyMarginTop}>
            {filteredResources.map(r => (
              <li key={`${r?.value?.kind}-${r?.value?.metadata?.name}`}>
                <Icon
                  className={`status status-${getIcon(r?.status)}`}
                  name={getIcon(r?.status)}
                  aria-label="status"
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
