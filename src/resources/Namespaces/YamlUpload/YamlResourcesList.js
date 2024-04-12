import React from 'react';
import { FlexBox, Icon, Switch, Text, Title } from '@ui5/webcomponents-react';
import { Trans, useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  getExtendedValidateResourceState,
  validateResourcesState,
} from 'state/preferences/validateResourcesAtom';

import {
  STATE_CREATED,
  STATE_ERROR,
  STATE_UPDATED,
  STATE_WAITING,
} from './useUploadResources';
import { FilteredResourcesDetails } from './FilteredResourcesDetails/FilteredResourcesDetails';

import './YamlResourcesList.scss';
import { spacing } from '@ui5/webcomponents-react-base';
import { activeNamespaceIdState } from '../../../state/activeNamespaceIdAtom';

export function YamlResourcesList({ resourcesData }) {
  const { t } = useTranslation();
  const [validateResources, setValidateResources] = useRecoilState(
    validateResourcesState,
  );
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const defaultNamespace = namespaceId || 'default';

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
          <FlexBox
            style={spacing.sapUiSmallMarginBeginEnd}
            direction={'Column'}
          >
            <Text className="additional-info">
              <Trans
                i18nKey={'upload-yaml.info'}
                values={{ namespace: defaultNamespace }}
              >
                <span style={{ fontWeight: 'bold' }}></span>
              </Trans>
            </Text>
            <Title level="H4">{t('upload-yaml.uploaded-resources')}</Title>
            <hr className={'yaml_resource_list__separation-line'} />
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
            <p>
              <Trans
                i18nKey={'upload-yaml.you-will-create'}
                values={{ count: filteredResources.length }}
              >
                <span style={{ fontWeight: 'bold' }}></span>
              </Trans>
            </p>
            <FilteredResourcesDetails filteredResources={filteredResources} />
          </FlexBox>
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
              <li
                key={`${r?.value?.kind}-${r?.value?.metadata?.name}`}
                style={spacing.sapUiTinyMarginBegin}
              >
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
