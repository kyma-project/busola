import {
  Card,
  CardHeader,
  ListItemCustom,
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
            data-testid={'yaml-upload-modal__validation-result'}
            style={{ overflowY: 'auto' }}
          >
            <FlexBox
              direction={'Column'}
              justifyContent={'SpaceBetween'}
              className="sap-margin-small"
              style={{
                gap: '1rem',
              }}
            >
              <p
                style={{
                  font: 'var(--sapFontFamily)',
                  fontSize: `var(--sapFontSize)`,
                  lineHeight: 'var(--sapContent_LineHeight)',
                  color: 'var(--sapTextColor)',
                }}
              >
                <Trans
                  i18nKey={'upload-yaml.info'}
                  values={{ namespace: defaultNamespace }}
                >
                  <span style={{ fontWeight: 'bold' }}></span>
                </Trans>
              </p>
              <Title level="H2" size="H4" className="sap-margin-top-small">
                {t('upload-yaml.uploaded-resources')}
              </Title>
              <SeparatorLine style={{ margin: '0rem -1rem' }} />
              <ValidationSwitch />
              <Text>
                <Trans
                  i18nKey={'upload-yaml.you-will-create'}
                  values={{ count: resources.length }}
                >
                  <span style={{ fontWeight: 'bold' }}></span>
                </Trans>
              </Text>
              {resources.map((r, idx) => (
                <ResourceValidationResult resource={r.value} key={idx} />
              ))}
            </FlexBox>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className={'yaml-upload-modal__content sap-margin-begin-tiny'}>
            <FlexBox
              direction={'Column'}
              justifyContent={'SpaceBetween'}
              className="sap-margin-begin-tiny"
              style={{
                gap: '1rem',
              }}
            >
              <Card
                header={
                  <CardHeader
                    titleText={t('upload-yaml.upload-progress')}
                    additionalText={
                      resources?.length + '/' + uploadedResources?.length
                    }
                  />
                }
              >
                <ProgressIndicator
                  value={getPercentage()}
                  valueState={
                    resources?.length === uploadedResources?.length
                      ? 'Positive'
                      : 'None'
                  }
                  className="sap-margin-x-small"
                  style={{
                    width: '95%',
                  }}
                />
              </Card>
              <List>
                {resources.map((r, idx) => (
                  <ListItemCustom key={idx} type="Inactive">
                    <FlexBox alignItems="Center">
                      <Icon
                        className={`status status-${getIcon(r?.status)}`}
                        name={getIcon(r?.status)}
                        accessibleName="status"
                      />
                      <Text>
                        {String(r?.value?.kind)}{' '}
                        {String(r?.value?.metadata?.name)} -{' '}
                        {getStatus(r?.status)}
                        {r?.message}
                      </Text>
                    </FlexBox>
                  </ListItemCustom>
                ))}
              </List>
            </FlexBox>
          </div>
        </>
      );
    }
  }
}
