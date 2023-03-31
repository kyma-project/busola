import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Button, MessageStrip } from 'fundamental-react';
import { validateResourcesState } from 'state/preferences/validateResourcesAtom';
import { useIsInCurrentNamespace } from 'shared/hooks/useIsInCurrentNamespace';
import { useValidateResourceBySchema } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';

import { Spinner } from 'shared/components/Spinner/Spinner';

import './FilteredResourcesDetails.scss';
import { useFeature } from 'hooks/useFeature';
import { validationSchemasEnabledState } from 'state/validationEnabledSchemasAtom';
import { useLoadingDebounce } from 'shared/hooks/useLoadingDebounce';

const WarningButton = ({
  handleShowWarnings,
  areWarningsVisible,
  warningsNumber,
  loading,
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
        {loading ? (
          <Spinner className="warning-spinner" size="s" center={false} />
        ) : (
          <p>{warningsNumber}</p>
        )}
      </div>
    </Button>
  );
};

const useNamespaceWarning = resource => {
  const { t } = useTranslation();
  return useIsInCurrentNamespace(resource)
    ? []
    : [
        {
          key: 'different-namespace',
          message: t('upload-yaml.warnings.different-namespace', {
            namespace: resource?.metadata?.namespace,
          }),
        },
      ];
};

const ValidationWarnings = ({ resource, validationSchema }) => {
  const { t } = useTranslation();
  const [areWarningsVisible, setVisibleWarnings] = useState(false);

  const { debounced, loading } = useLoadingDebounce(resource, 500);

  //we expect two types here: []string or Promise
  const warnings = [
    useValidateResourceBySchema(debounced, validationSchema),
    useNamespaceWarning(debounced),
  ];

  // if the validationSchema is not yet available, set it to loading
  if (!validationSchema)
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
        {loading ? (
          <Spinner className="warning-spinner" size="s" center={false} />
        ) : (
          <></>
        )}
      </MessageStrip>
    );

  return (
    <div>
      <WarningButton
        handleShowWarnings={() => setVisibleWarnings(prevState => !prevState)}
        areWarningsVisible={areWarningsVisible}
        warningsNumber={warnings.flat().length}
        loading={loading}
      />
      {areWarningsVisible ? (
        <ul className="warnings-list">
          {warnings.flat().map((warning, i) => (
            <li
              key={`${resource?.kind}-${
                resource?.metadata?.name
              }-${warning.key ?? i}`}
            >
              <MessageStrip type="warning" className="fd-margin-top--sm">
                {warning.message}
              </MessageStrip>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export const FilteredResourcesDetails = ({ filteredResources }) => {
  const validateResources = useRecoilValue(validateResourcesState);
  const { isEnabled, config } = useFeature('VALIDATION');
  console.log(isEnabled, config);
  const validationSchemas = useRecoilValue(validationSchemasEnabledState);

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
          {validateResources ? (
            <ValidationWarnings
              resource={r?.value}
              validationSchema={validationSchemas}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
};
