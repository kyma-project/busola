import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsInCurrentNamespace } from 'shared/hooks/useIsInCurrentNamespace';
import { useValidateResourceBySchema } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';

import { Button, MessageStrip } from 'fundamental-react';
import { Spinner } from 'shared/components/Spinner/Spinner';

import './FilteredResourcesDetails.scss';

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
            ? t('upload-yaml.buttons.show-warnings')
            : t('upload-yaml.buttons.hide-warnings')}
        </p>
        <p>{warningsNumber}</p>
      </div>
    </Button>
  );
};

const useNamespaceWarning = resource => {
  const { t } = useTranslation();
  return useIsInCurrentNamespace(resource)
    ? []
    : [
        t('upload-yaml.warnings.different-namespace', {
          namespace: resource?.metadata?.namespace,
        }),
      ];
};

const ValidationWarnings = ({ resource }) => {
  const { t } = useTranslation();
  const [areWarningsVisible, setVisibleWarnings] = useState(false);

  //we expect two types here: []string or Promise
  const warnings = [
    useValidateResourceBySchema,
    useNamespaceWarning,
  ].map(validate => validate(resource));

  // if the element has the then function, it means it's a Promise
  if (warnings.some(w => w.then))
    return (
      <MessageStrip
        type="warning"
        className="fd-margin-bottom--sm fd-messsage_strip__content"
      >
        <p> {t('common.headers.loading')}</p>
        <Spinner className="warning-spinner" size="s" center={false} />
      </MessageStrip>
    );

  if (warnings.flat().length === 0)
    return (
      <MessageStrip type="success" className="fd-margin-bottom--sm">
        {t('upload-yaml.messages.no-warnings-found')}
      </MessageStrip>
    );

  return (
    <div>
      <WarningButton
        handleShowWarnings={() => setVisibleWarnings(prevState => !prevState)}
        areWarningsVisible={areWarningsVisible}
        warningsNumber={warnings.flat().length}
      />
      {areWarningsVisible ? (
        <ul className="warnings-list">
          {warnings.flat().map(err => (
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
            {String(r?.value?.kind)} {String(r?.value?.metadata?.name)}
          </p>
          {isValidationOn ? <ValidationWarnings resource={r?.value} /> : null}
        </li>
      ))}
    </ul>
  );
};
