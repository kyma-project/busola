import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Button, MessageStrip } from 'fundamental-react';
import {
  getExtendedValidateResourceState,
  validateResourcesState,
} from 'state/preferences/validateResourcesAtom';
import { useIsInCurrentNamespace } from 'shared/hooks/useIsInCurrentNamespace';
import { useValidateResourceBySchema } from 'shared/hooks/useValidateResourceBySchema/useValidateResourceBySchema';

import { Spinner } from 'shared/components/Spinner/Spinner';

import './FilteredResourcesDetails.scss';
import { validationSchemasEnabledState } from 'state/validationEnabledSchemasAtom';
import { useLoadingDebounce } from 'shared/hooks/useLoadingDebounce';

const WarningButton = ({
  handleShowWarnings,
  areWarningsVisible,
  warningsNumber,
  loading,
}) => {
  const { t } = useTranslation();

  const noWarnings = warningsNumber === 0;

  return (
    <Button
      onClick={noWarnings || handleShowWarnings}
      className="warning-button"
      type={noWarnings ? 'positive' : 'attention'}
      glyph={
        noWarnings
          ? 'message-success'
          : areWarningsVisible
          ? 'navigation-up-arrow'
          : 'navigation-down-arrow'
      }
    >
      <div>
        <p>
          {noWarnings
            ? t('upload-yaml.messages.no-warnings-found')
            : areWarningsVisible
            ? t('upload-yaml.buttons.hide-warnings')
            : t('upload-yaml.buttons.show-warnings')}
        </p>
        {loading ? (
          <Spinner
            className={noWarnings ? 'positive-spinner' : 'warning-spinner'}
            size="s"
            center={false}
          />
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
  const validateResources = getExtendedValidateResourceState(
    useRecoilValue(validateResourcesState),
  );
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
          {validateResources.enabled && (
            <ValidationWarnings
              resource={r?.value}
              validationSchema={validationSchemas}
            />
          )}
        </li>
      ))}
    </ul>
  );
};
