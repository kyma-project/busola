import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { createFetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { useRecoilState, useRecoilValue } from 'recoil';
import { validationSchemasEnabledState } from 'state/validationEnabledSchemasAtom';
import { ResourceValidation } from './ResourceValidation';
import { Button } from 'fundamental-react';

import './ClusterValidation.scss';
import { ResourceLoader } from './ResourceLoader';
import { createPostFn } from 'shared/hooks/BackendAPI/usePost';
import { Scan } from './Scan';
import { ScanResultTree } from './ScanResultTree';
import PQueue from 'p-queue';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';
import {
  Bar,
  Card,
  CardHeader,
  FlexBox,
  ProgressIndicator,
} from '@ui5/webcomponents-react';
import { ClusterValidationConfigurationDialog } from './ClusterValidationConfiguration';
import { resourcesState } from 'state/resourcesAtom';

import { authDataState } from 'state/authDataAtom';
import { clusterState } from 'state/clusterAtom';
import { getDefaultScanConfiguration } from './ScanConfiguration';

function ClusterValidation() {
  const { t } = useTranslation();

  const authData = useRecoilValue(authDataState);
  const cluster = useRecoilValue(clusterState);

  const { fetch, post } = useMemo(() => {
    const fetch = createFetchFn({
      authData,
      cluster,
    });
    const post = createPostFn(fetch);
    return { fetch, post };
  }, [authData, cluster]);
  const resourceLoader = useMemo(
    () =>
      new ResourceLoader(
        relativeUrl => fetch({ relativeUrl }),
        undefined,
        null,
      ),
    [fetch],
  );
  const validationSchemas = useRecoilValue(validationSchemasEnabledState);

  const { namespaces } = useAvailableNamespaces();

  const [resources, setResources] = useRecoilState(resourcesState);

  const listableResources = useMemo(() => {
    return resources?.filter(resource => resource.verbs?.includes('list'));
  }, [resources]);

  useEffect(() => {
    resourceLoader.loadResourceLists().then(resourceList => {
      setResources(resourceList);
    });
  }, [resourceLoader, setResources]);

  const defaultConfiguration = useMemo(
    () => getDefaultScanConfiguration(namespaces, listableResources, []),
    [namespaces, listableResources],
  );

  const [selectedConfiguration, setConfiguration] = useState(null);
  const configuration = useMemo(
    () => selectedConfiguration ?? defaultConfiguration,
    [selectedConfiguration, defaultConfiguration],
  );
  const [isConfigurationOpen, setConfigurationOpen] = useState(false);
  const configure = () => {
    setConfigurationOpen(true);
  };

  const [scanResult, _setScanResult] = useState();
  const setScanResult = result => {
    _setScanResult({ ...result });
  };

  const scanSettings = {
    concurrentRequests: configuration?.scanParameters?.parallelRequests ?? 5,
    concurrentWorkers:
      configuration?.scanParameters?.parallelWorkerThreads ?? 1,
    backpressureBuffer: 3,
  };
  resourceLoader.queue.concurrency = scanSettings.concurrentRequests;

  const [scanProgress, setScanProgress] = useState();

  const scan = async () => {
    setScanProgress({});
    const currentScan = new Scan(resourceLoader, validationSchemas);
    setScanResult(currentScan.result);
    await ResourceValidation.setRuleset(validationSchemas);

    const existingScanResult = localStorage.getItem(
      'cached-scan-result-for-test',
    );
    if (existingScanResult) {
      currentScan.result = JSON.parse(existingScanResult);
      setScanResult(currentScan.result);
      return;
    }

    const resourcesToScan = resources.filter(resource =>
      configuration?.resources.includes(resource.kind),
    );

    await currentScan.gatherAPIResources({
      namespaces: configuration?.namespaces,
      resources: resourcesToScan,
    });
    setScanResult(currentScan.result);

    console.log('after gathering api resources', currentScan.result.namespaces);

    await currentScan.checkPermissions(post);
    setScanResult(currentScan.result);

    let countScanned = 0;
    const queue = new PQueue({
      concurrency:
        Math.max(
          configuration.scanParameters.parallelRequests,
          configuration.scanParameters.parallelWorkerThreads,
        ) + scanSettings.backpressureBuffer,
    });
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

    localStorage.setItem(
      'cached-scan-result-for-test',
      JSON.stringify(currentScan.result),
    );
  };

  const clear = () => {
    localStorage.removeItem('cached-scan-result-for-test');
    setScanResult();
    setScanProgress();
  };

  return (
    <>
      <Bar
        endContent={
          <>
            <Button glyph="play" onClick={scan} disabled={!!scanProgress}>
              Scan
            </Button>
            <Button
              glyph="settings"
              onClick={configure}
              disabled={!!scanProgress}
            >
              Configure
            </Button>
            <Button glyph="reset" onClick={clear} disabled={!scanProgress}>
              Clear
            </Button>
          </>
        }
        startContent={<h3>Cluster Validation</h3>}
      ></Bar>

      <Section
        titleText="Scan Progress"
        status={
          scanProgress
            ? `${scanProgress.scanned ?? 0} / ${scanProgress.total ?? '?'}`
            : 'Not started'
        }
      >
        <ProgressIndicator
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
      </Section>

      <Section titleText="Scan Scope">
        <FlexBox>
          <InfoTile
            title="Namespaces"
            content={
              !configuration?.namespaces
                ? 'N/A'
                : configuration?.namespaces?.length
            }
          />
          <InfoTile
            title="K8s API Resources"
            content={
              !configuration?.resources
                ? 'N/A'
                : configuration?.resources.length
            }
          />
        </FlexBox>
      </Section>

      <Section titleText="Scan Result">
        <ScanResultTree scanResult={scanResult} />
      </Section>

      <ClusterValidationConfigurationDialog
        show={isConfigurationOpen}
        onCancel={() => setConfigurationOpen(false)}
        onSubmit={newConfiguration => {
          setConfiguration(newConfiguration);
          setConfigurationOpen(false);
        }}
        configuration={configuration}
        namespaces={namespaces}
        resources={listableResources}
      />
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
