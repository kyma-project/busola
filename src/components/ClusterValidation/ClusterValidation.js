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
import {
  Bar,
  Card,
  CardHeader,
  FlexBox,
  Label,
  Page,
  ProgressIndicator,
} from '@ui5/webcomponents-react';

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
    setScanProgress();
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
    // const toScan = [...currentScan.listResourcesToScan({ namespaces: ['jv'] })];
    const toScan = [...currentScan.listResourcesToScan()];
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
      <Bar
        endContent={
          <>
            <Button glyph="play" onClick={scan}>
              Scan
            </Button>
            <Button glyph="reset" onClick={clear}>
              Clear
            </Button>
          </>
        }
      >
        <Label>Cluster Validation</Label>
      </Bar>

      <Section>
        <FlexBox>
          <InfoTile
            title="Namespaces"
            content={
              !scanResult?.namespaces
                ? 'N/A'
                : Object.keys(scanResult.namespaces)?.length
            }
          />
          <Card style={{ width: 'fit-content', margin: '5px' }}>
            <Label>Test</Label>
          </Card>
        </FlexBox>
      </Section>
      <Section
        titleText="Scan Progress"
        status={
          scanProgress
            ? `${scanProgress.scanned} / ${scanProgress.total}`
            : 'Not started'
        }
      >
        <ProgressIndicator
          // displayValue={scanProgress? `${scanProgress.scanned} / ${scanProgress.total}` : 'Not started'}
          value={
            scanProgress
              ? Math.floor((100 * scanProgress.scanned) / scanProgress.total)
              : 0
          }
          valueState={
            scanProgress && scanProgress.total === scanProgress.scanned
              ? 'Success'
              : 'None'
          }
          style={{ width: '96%', padding: '5px 2%' }}
        ></ProgressIndicator>
        {/* <FlexBox style={{margin: '10px'}}>
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
      </FlexBox> */}
      </Section>

      <Section titleText="Scan Result">
        <ScanResultTree scanResult={scanResult} />
      </Section>
    </>
  );
}

const InfoTile = ({ title, content }) => {
  return (
    <Card
      header={<CardHeader titleText={title} subtitleText={content} />}
      style={{ width: 'fit-content', margin: '5px' }}
    ></Card>
  );
};

const Section = ({ titleText, subtitleText, status, header, children }) => {
  return (
    <FlexBox alignItems="Center" justifyContent="Center">
      <Card
        header={
          titleText ?? subtitleText ?? status ? (
            <CardHeader
              titleText={titleText}
              subtitleText={subtitleText}
              status={status}
            />
          ) : (
            header
          )
        }
        style={{ width: '95%', margin: '5px' }}
      >
        {children}
      </Card>
    </FlexBox>
  );
};

export default ClusterValidation;
