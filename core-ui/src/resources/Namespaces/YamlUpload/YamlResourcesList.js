import React, { useState, useMemo } from 'react';
import pluralize from 'pluralize';
import { Button, Icon, MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import {
  STATE_ERROR,
  STATE_WAITING,
  STATE_UPDATED,
  STATE_CREATED,
} from './useUploadResources';
import './YamlResourcesList.scss';
import { validateResourceBySchema } from './helpers';

export function YamlResourcesList({
  resourcesData,
  namespace,
  isValidationOn,
}) {
  const { t } = useTranslation();
  const { namespaceNodes } = useMicrofrontendContext();
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

  const isInCurrentNamespace = resource => {
    const resourceType = pluralize(resource?.kind?.toLowerCase());
    const resourceNamespace = resource?.metadata?.namespace;
    const hasCurrentNamespace =
      namespace && resourceNamespace ? resourceNamespace === namespace : true;
    const isKnownNamespaceWide = !!namespaceNodes?.find(
      n => n.resourceType === resourceType,
    );

    return !(isKnownNamespaceWide && !hasCurrentNamespace);
  };

  const NamespaceWarning = ({ resource }) => {
    if (!isInCurrentNamespace(resource)) {
      return (
        <MessageStrip type="warning" className="fd-margin-top--sm">
          {t('upload-yaml.warnings.different-namespace', {
            namespace: resource?.metadata?.namespace,
          })}
        </MessageStrip>
      );
    }
    return null;
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

  const WarningButton = ({
    handleShowWarnings,
    areWarningsVisible,
    warningsAmount,
  }) => {
    return (
      <Button
        onClick={handleShowWarnings}
        className="warning-button"
        type="attention"
        glyph={
          areWarningsVisible ? 'navigation-up-arrow' : 'navigation-down-arrow'
        }
      >
        <div>
          <p>
            {!areWarningsVisible
              ? t('common.buttons.see-warnings')
              : t('common.buttons.hide-warnings')}
          </p>
          <p>{warningsAmount}</p>
        </div>
      </Button>
    );
  };

  const ValidationWarnings = ({ resource }) => {
    const warnings = useMemo(() => validateResourceBySchema(resource), [
      resource,
    ]);
    const [areWarningsVisible, setVisibleWarnings] = useState(false);
    const isButtonShown =
      warnings.length > 0 || !isInCurrentNamespace(resource);
    return (
      <>
        {isButtonShown && (
          <WarningButton
            handleShowWarnings={() => {
              setVisibleWarnings(prevState => !prevState);
            }}
            areWarningsVisible={areWarningsVisible}
            warningsAmount={warnings.length}
          />
        )}
        {areWarningsVisible ? (
          <ul>
            <NamespaceWarning resource={resource} />
            {warnings.map(err => (
              <li key={`${resource?.kind}-${resource?.metadata?.name}-${err}`}>
                <MessageStrip type="warning" className="fd-margin-top--sm">
                  {err}
                </MessageStrip>
              </li>
            ))}
          </ul>
        ) : null}
      </>
    );
  };

  const FilteredResourcesDetails = () => {
    console.log(isValidationOn);
    return (
      <ul>
        {filteredResources.map(r => (
          <li
            className="fd-margin-begin--sm fd-margin-end--sm fd-margin-bottom--sm"
            style={{ listStyle: 'disc' }}
            key={`${r?.value?.kind}-${r.value?.metadata?.name}`}
          >
            <p style={{ fontSize: '16px' }}>
              {r?.value?.kind} {r?.value?.metadata?.name}
            </p>
            {isValidationOn ? <ValidationWarnings resource={r?.value} /> : null}
          </li>
        ))}
      </ul>
    );
  };

  const getStatus = status => {
    return t(`upload-yaml.statuses.${status.toLowerCase()}`);
  };

  if (!filteredResources) {
    return null;
  } else {
    if (showResourcesToUpload()) {
      return (
        <div>
          <p className="fd-margin-top--md">
            {t(
              filteredResources.length === 1
                ? 'upload-yaml.you-will-create_one'
                : 'upload-yaml.you-will-create_other',
              {
                count: filteredResources.length || 0,
              },
            )}
          </p>
          <FilteredResourcesDetails />
        </div>
      );
    } else {
      return (
        <div className="fd-margin-top--md">
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
