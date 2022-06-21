import React, { useState, useMemo } from 'react';
import { Button, MessageStrip } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import './YamlResourcesList.scss';
import { validateResourceBySchema } from './helpers';
import { useIsInCurrentNamespace } from 'shared/hooks/useIsInCurrentNamespace';

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
  warningsAmount,
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
        <p>{warningsAmount}</p>
      </div>
    </Button>
  );
};

const ValidationWarnings = ({ resource }) => {
  const [areWarningsVisible, setVisibleWarnings] = useState(false);
  const isInCurrentNamespace = useIsInCurrentNamespace(resource);

  const stringifiedResource = JSON.stringify(resource);
  const warnings = useMemo(() => validateResourceBySchema(resource), [
    stringifiedResource,
  ]);

  const isButtonShown = warnings.length > 0 || isInCurrentNamespace;

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

export const FilteredResourcesDetails = ({
  filteredResources,
  isValidationOn,
}) => {
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
