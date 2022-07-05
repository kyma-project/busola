import React, { useState } from 'react';
import { useIsInCurrentNamespace } from 'shared/hooks/useIsInCurrentNamespace';
import { useValidateResourceBySchema } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';
import { useTranslation } from 'react-i18next';

import { Button, MessageStrip } from 'fundamental-react';
import { Spinner } from 'shared/components/Spinner/Spinner';

import './FilteredResourcesDetails.scss';

const NamespaceWarning = ({ resource }) => {
  const { t } = useTranslation();
  if (!useIsInCurrentNamespace(resource)) {
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

const WarningButton = ({
  handleShowWarnings,
  areWarningsVisible,
  warningsNumber,
}) => {
  const { t } = useTranslation();

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
        {!warningsNumber ? (
          <Spinner className="warning-spinner" size="s" center={false} />
        ) : (
          <p>{warningsNumber}</p>
        )}
      </div>
    </Button>
  );
};

const ValidationWarnings = ({ resource }) => {
  const [areWarningsVisible, setVisibleWarnings] = useState(false);
  const isInCurrentNamespace = useIsInCurrentNamespace(resource);
  const warnings = useValidateResourceBySchema(resource);
  const isButtonShown = warnings?.length > 0 || isInCurrentNamespace;

  return (
    <div>
      {isButtonShown && (
        <WarningButton
          handleShowWarnings={() => {
            setVisibleWarnings(prevState => !prevState);
          }}
          areWarningsVisible={areWarningsVisible}
          warningsNumber={warnings?.length + Number(!isInCurrentNamespace)}
        />
      )}
      {areWarningsVisible ? (
        <ul className="warnings-list">
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
    </div>
  );
};

export const FilteredResourcesDetails = ({
  filteredResources,
  isValidationOn,
}) => {
  return (
    <ul className="resources-list">
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
