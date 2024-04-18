import React from 'react';
import { FlexBox, Icon, Title } from '@ui5/webcomponents-react';
import { Trans, useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

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
import { SeparatorLine } from './SeparatorLine';
import { ValidationSwitch } from './ValidationSwitch';

export function YamlResourcesList({ resourcesData }) {
  const { t } = useTranslation();
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const defaultNamespace = namespaceId || 'default';

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
            className={'yaml-upload-modal__content'}
            data-testID={'yaml-upload-modal__validation-result'}
            style={{ overflowY: 'auto' }}
          >
            <FlexBox
              direction={'Column'}
              justifyContent={'SpaceBetween'}
              style={{
                gap: '1rem',
                ...spacing.sapUiSmallMargin,
              }}
            >
              <p>
                <Trans
                  i18nKey={'upload-yaml.info'}
                  values={{ namespace: defaultNamespace }}
                >
                  <span style={{ fontWeight: 'bold' }}></span>
                </Trans>
              </p>
              <Title level="H4">{t('upload-yaml.uploaded-resources')}</Title>
              <SeparatorLine />
              <ValidationSwitch />
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
          </div>
        </>
      );
    } else {
      return (
        <>
          <div
            className={'yaml-upload-modal__content'}
            style={spacing.sapUiTinyMarginBegin}
          >
            <FlexBox
              direction={'Column'}
              justifyContent={'SpaceBetween'}
              style={{
                gap: '1rem',
                ...spacing.sapUiSmallMargin,
              }}
            >
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
                    {String(r?.value?.kind)} {String(r?.value?.metadata?.name)}{' '}
                    - {getStatus(r?.status)}
                    <p>{r?.message}</p>
                  </li>
                ))}
              </ul>
            </FlexBox>
          </div>
        </>
      );
    }
  }
}
