import { PageHeader } from 'shared/components/PageHeader/PageHeader';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { loadResources, loadResourcesConcurrently } from './ResourceLoader';
import { useRecoilValue } from 'recoil';
import { validationSchemasEnabledState } from 'state/validationEnabledSchemasAtom';
import { ResourceValidation } from './ResourceValidation';
import { ResourceWarningList, ValidationWarnings } from './ValidationWarnings';
import { Button, LayoutPanel, Tile } from 'fundamental-react';

import './ClusterValidation.scss';
import { ResourceLoader } from './ResourceLoader2';
import { getInitialScanResult } from './ScanResult';
import { createPostFn } from 'shared/hooks/BackendAPI/usePost';
import { doesUserHavePermission } from 'state/navigation/filters/permissions';
import { Scan } from './Scan';
import { getPermissionResourceRules } from 'state/permissionSetsSelector';
import { ScanResultTree } from './ScanResultTree';
import PQueue from 'p-queue';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';
import { Page } from '@ui5/webcomponents-react';

async function fetchResources(fetch) {
  // const response = await fetch({relativeUrl: `/apis/apps/v1/namespaces/jv/deployments?limit=500`});
  const response = await fetch({
    relativeUrl: `/api/v1/namespaces/jv/pods?limit=500`,
  });
  const data = await response.json();
  return data.items;
}

function ClusterValidation() {
  const { t } = useTranslation();
  const fetch = useFetch();
  const post = createPostFn(fetch);
  const resourceLoader = new ResourceLoader(relativeUrl =>
    fetch({ relativeUrl }),
  );
  const validationSchemas = useRecoilValue(validationSchemasEnabledState);

  const { namespaces } = useAvailableNamespaces();

  const [resources, setResources] = useState([]);

  const [scanResult, _setScanResult] = useState();
  const setScanResult = result => {
    console.log('setting scan result', result);
    _setScanResult({ ...result });
  };

  const scanSettings = {
    concurrentRequests: 5,
    concurrentWorkers: 1,
    backpressureBuffer: 3,
  };
  resourceLoader.queue.concurrency = scanSettings.concurrentRequests;

  const [scanProgress, setScanProgress] = useState();

  const currentResources = [];

  const scan = async () => {
    const currentScan = new Scan(resourceLoader, validationSchemas);
    setScanResult(currentScan.result);
    await ResourceValidation.setRuleset(validationSchemas);

    const existingResourcesString = localStorage.getItem(
      'cached-resources-for-test',
    );
    if (existingResourcesString) {
      const existingResources = JSON.parse(existingResourcesString);
      setResources(existingResources);
      currentResources.push(...existingResources);
    }
    const existingScanResult = localStorage.getItem(
      'cached-scan-result-for-test',
    );
    if (existingScanResult) {
      currentScan.result = JSON.parse(existingScanResult);
      setScanResult(currentScan.result);
      return;
    }

    await currentScan.gatherAPIResources({ namespaces });
    setScanResult(currentScan.result);

    console.log('after gathering api resources', currentScan.result.namespaces);

    await currentScan.checkPermissions(post);
    setScanResult(currentScan.result);

    let countScanned = 0;
    const queue = new PQueue({
      concurrency:
        Math.max(
          scanSettings.concurrentRequests,
          scanSettings.concurrentWorkers,
        ) + scanSettings.backpressureBuffer,
    });
    const toScan = [...currentScan.listResourcesToScan({ namespaces: ['jv'] })];
    setScanProgress({ total: toScan.length });
    await Promise.all(
      toScan.map(async resource =>
        queue.add(async () => {
          await currentScan.scanResource(resource);
          countScanned++;
          setScanProgress({ total: toScan.length, scanned: countScanned });
          setScanResult(currentScan.result);
        }),
      ),
    );
    // for (const resource of ) {
    //   console.log(`scan: ${resource.endpoint}`);
    //   countToScan++;
    //   await currentScan.scanResource(resource);
    //   console.log(`scanned: ${resource.endpoint}`);

    // }

    console.log(currentScan.result);

    currentResources.push(
      ...Object.values(currentScan.result.namespaces ?? {}).flatMap(
        ({ name: namespace, resources }) =>
          resources.flatMap(
            ({ kind, items }) =>
              items?.map(({ name, warnings }) => ({
                value: {
                  kind,
                  metadata: {
                    name: `${namespace} - ${name}`,
                  },
                },
                warnings,
              })) ?? [],
          ),
      ),
    );

    // for await (const rs of loadResourcesConcurrently(relativeUrl =>
    //   fetch({ relativeUrl }),
    // )) {
    //   const newResources = rs.items.map(r => ({
    //     value: { kind: rs.kind, ...r },
    //   }));
    //   currentResources.push(...newResources);
    //   const warningsPerResource = await ResourceValidation.validate(
    //     newResources,
    //   );
    //   warningsPerResource.forEach((warnings, i) => {
    //     newResources[i].warnings = warnings;
    //   });
    //   setResources([...currentResources]);
    // }
    console.log(currentResources);
    setResources([...currentResources]);
    localStorage.setItem(
      'cached-resources-for-test',
      JSON.stringify(currentResources),
    );
    localStorage.setItem(
      'cached-scan-result-for-test',
      JSON.stringify(currentScan.result),
    );
  };

  const clear = () => {
    localStorage.removeItem('cached-resources-for-test');
    localStorage.removeItem('cached-scan-result-for-test');
    setResources([]);
    currentResources.length = 0;
  };

  // fetchResources(fetch).then(r => {
  //   console.log(r);
  //   setResources(r.map(resource => ({value: {kind: 'Pod', ...resource}})));
  // });

  return (
    <>
      <PageHeader title={t('clusters.overview.title-all-clusters')} />
      {/* <FilteredResourcesDetails filteredResources={resources} /> */}
      <LayoutPanel>
        <LayoutPanel.Header>
          <LayoutPanel.Head
            description="description"
            title="Cluster Validation"
          />
          <LayoutPanel.Actions>
            <Button glyph="play" onClick={scan}>
              Scan
            </Button>
            <Button glyph="reset" onClick={clear}>
              Clear
            </Button>
          </LayoutPanel.Actions>
        </LayoutPanel.Header>
        <LayoutPanel.Filters>
          <div style={{ display: 'flex' }}>
            <InfoTile
              title="Namespaces"
              content={
                !scanResult?.namespaces
                  ? 'N/A'
                  : Object.keys(scanResult.namespaces)?.length
              }
            />
            <InfoTile
              title="Items Scanned"
              content={
                scanResult?.cluster?.resources?.reduce(
                  (agg, resource) => agg + (resource.items?.length ?? 0),
                  0,
                ) ?? 0 + scanResult?.namespaces
                  ? Object.values(scanResult.namespaces).reduce(
                      (agg, { resources }) =>
                        agg +
                        resources.reduce(
                          (agg, resource) =>
                            agg + (resource.items?.length ?? 0),
                          0,
                        ),
                      0,
                    )
                  : 0
              }
            />
            <InfoTile
              title="Scan"
              content={
                scanProgress
                  ? `${scanProgress.scanned} / ${scanProgress.total}`
                  : '-'
              }
            />
          </div>
        </LayoutPanel.Filters>
        <LayoutPanel.Body>
          {/* <ResourceWarningList resources={resources} /> */}
          <ScanResultTree scanResult={scanResult} />
        </LayoutPanel.Body>
      </LayoutPanel>
    </>
  );
}

const InfoTile = ({ title, content }) => {
  return (
    <Tile className="no-min-height" size="s">
      <Tile.Header className="no-min-height">{title}</Tile.Header>
      <Tile.Content className="no-min-height">{content}</Tile.Content>
    </Tile>
  );
};

export default ClusterValidation;
