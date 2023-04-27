import { MessageStrip } from 'fundamental-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WarningButton } from 'resources/Namespaces/YamlUpload/FilteredResourcesDetails/FilteredResourcesDetails';

export const ResourceWarningList = ({ resources }) => {
  return (
    <ul className="resources-list">
      {resources.map(r => (
        <li
          className="fd-margin-begin--sm fd-margin-end--sm fd-margin-bottom--sm"
          style={{ listStyle: 'disc' }}
          key={`${r?.value?.kind}-${r.value?.metadata?.name}`}
        >
          <p style={{ fontSize: '16px' }}>
            {String(r?.value?.kind)} {String(r?.value?.metadata?.name)}
          </p>
          {r.warnings && (
            <ValidationWarnings resource={r?.value} warnings={r?.warnings} />
          )}
        </li>
      ))}
    </ul>
  );
};

export const ValidationWarnings = ({ resource, warnings }) => {
  const { t } = useTranslation();
  const [areWarningsVisible, setVisibleWarnings] = useState(false);

  return (
    <div>
      <WarningButton
        handleShowWarnings={() => setVisibleWarnings(prevState => !prevState)}
        areWarningsVisible={areWarningsVisible}
        warningsNumber={warnings.flat().length}
        loading={false}
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
