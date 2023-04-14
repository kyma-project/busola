import { PageHeader } from 'shared/components/PageHeader/PageHeader';

import { useTranslation } from 'react-i18next';
import {
  FilteredResourcesDetails,
  WarningButton,
} from 'resources/Namespaces/YamlUpload/FilteredResourcesDetails/FilteredResourcesDetails';
import { useEffect, useState } from 'react';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { loadResources, loadResourcesConcurrently } from './ResourceLoader';
import { useRecoilValue } from 'recoil';
import { validationSchemasEnabledState } from 'state/validationEnabledSchemasAtom';
import { MessageStrip } from 'fundamental-react';

async function fetchResources(fetch) {
  // const response = await fetch({relativeUrl: `/apis/apps/v1/namespaces/jv/deployments?limit=500`});
  const response = await fetch({
    relativeUrl: `/api/v1/namespaces/jv/pods?limit=500`,
  });
  const data = await response.json();
  return data.items;
}

const worker = new Worker(
  new URL('./ResourceValidation.worker.js', import.meta.url),
  { type: 'module' },
);

const executeInWorker = (...args) => {
  return new Promise(resolve => {
    worker.addEventListener(
      'message',
      event => {
        resolve(event.data);
      },
      { once: true },
    );
    worker.postMessage(...args);
  });
};

function ClusterValidation() {
  const { t } = useTranslation();
  const validationSchemas = useRecoilValue(validationSchemasEnabledState);

  const [resources, setResources] = useState([]);

  const currentResources = [];

  const fetch = useFetch();
  useEffect(() => {
    console.log('fetching');
    const _load = async () => {
      await executeInWorker(['setRuleset', validationSchemas]);

      const existingResourcesString = localStorage.getItem(
        'cached-resources-for-test',
      );
      if (false && existingResourcesString) {
        const existingResources = JSON.parse(existingResourcesString);
        setResources(existingResources);
        currentResources.push(...existingResources);
        return;
      }

      for await (const rs of loadResourcesConcurrently(relativeUrl =>
        fetch({ relativeUrl }),
      )) {
        const newResources = rs.items.map(r => ({
          value: { kind: rs.kind, ...r },
        }));
        currentResources.push(...newResources);
        const warningsPerResource = await executeInWorker([
          'validate',
          newResources,
        ]);
        warningsPerResource.forEach((warnings, i) => {
          newResources[i].warnings = warnings;
        });
        setResources([...currentResources]);
      }
      console.log(currentResources);
      setResources([...currentResources]);
      localStorage.setItem(
        'cached-resources-for-test',
        JSON.stringify(currentResources),
      );
    };
    _load().then(async () => {
      // console.log('validating...');
      // const result = await executeInWorker(['validate', currentResources]);
      // console.log('result', result);
    });

    return () => {
      // cancel loading
    };

    // fetchResources(fetch).then(r => {
    //   console.log(r);
    //   setResources(r.map(resource => ({value: {kind: 'Pod', ...resource}})));
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader title={t('clusters.overview.title-all-clusters')} />
      {/* <FilteredResourcesDetails filteredResources={resources} /> */}
      <div>resource number: {resources.length}</div>
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
    </>
  );
}

const ValidationWarnings = ({ resource, warnings }) => {
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

export default ClusterValidation;
