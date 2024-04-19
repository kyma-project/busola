import React from 'react';
import {
  Card,
  CardHeader,
  CustomListItem,
  FlexBox,
  Icon,
  List,
  ProgressIndicator,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { Trans, useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import './YamlResourceList.scss';

import {
  STATE_CREATED,
  STATE_ERROR,
  STATE_UPDATED,
  STATE_WAITING,
} from './useUploadResources';
import { ResourceValidationResult } from './ResourceValidationResult';

import { spacing } from '@ui5/webcomponents-react-base';
import { activeNamespaceIdState } from '../../../state/activeNamespaceIdAtom';
import { SeparatorLine } from './SeparatorLine';
import { ValidationSwitch } from './ValidationSwitch';

export function YamlResourcesList({ resourcesData }) {
  const { t } = useTranslation();
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const defaultNamespace = namespaceId || 'default';

  const resources = resourcesData?.filter(resource => resource !== null);

  const showResourcesToUpload = () => {
    return !resources?.filter(r => r.status)?.length;
  };

  const uploadedResources = resources?.filter(
    r => r.status && r.status !== STATE_WAITING,
  );

  const getPercentage = () => {
    return (
      ((resources?.filter(r => r.status && r.status !== STATE_WAITING)
        ?.length || 0) /
        (resources?.length || 0)) *
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

  if (!resources) {
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
                  values={{ count: resources.length }}
                >
                  <span style={{ fontWeight: 'bold' }}></span>
                </Trans>
              </p>
              {resources.map(r => (
                <ResourceValidationResult resource={r.value} />
              ))}
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
              <Card
                header={
                  <CardHeader
                    titleText={t('upload-yaml.upload-progress')}
                    status={resources?.length + '/' + uploadedResources?.length}
                  />
                }
              >
                <ProgressIndicator
                  value={getPercentage()}
                  valueState={
                    resources?.length === uploadedResources?.length
                      ? 'Success'
                      : 'None'
                  }
                  style={{
                    width: '95%',
                    ...spacing.sapUiSmallMarginBeginEnd,
                  }}
                />
              </Card>
              <List>
                {resources.map(r => (
                  <CustomListItem type={'Inactive'}>
                    <FlexBox alignItems={'Center'}>
                      <Icon
                        className={`status status-${getIcon(r?.status)}`}
                        name={getIcon(r?.status)}
                        aria-label="status"
                      />
                      <Text>
                        {String(r?.value?.kind)}{' '}
                        {String(r?.value?.metadata?.name)} -{' '}
                        {getStatus(r?.status)}
                      </Text>
                    </FlexBox>
                  </CustomListItem>
                ))}
              </List>
            </FlexBox>
          </div>
        </>
      );
    }
  }
}
