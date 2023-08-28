import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { createFetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  getValidationEnabledSchemas,
  usePolicySet,
} from 'state/validationEnabledSchemasAtom';
import { ResourceValidation } from './ResourceValidation';
import { LayoutPanel } from 'fundamental-react';

import { ResourceLoader } from './ResourceLoader';
import { createPostFn } from 'shared/hooks/BackendAPI/usePost';
import { Scan, ScanProgress } from './Scan';
import { ScanResultTree } from './ScanResultTree';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';
import {
  Button,
  Card,
  CardHeader,
  FlexBox,
  Loader,
  ProgressIndicator,
} from '@ui5/webcomponents-react';
import { ClusterValidationConfigurationDialog } from './ClusterValidationConfiguration';
import { resourcesState } from 'state/resourcesAtom';

import { authDataState } from 'state/authDataAtom';
import { clusterState } from 'state/clusterAtom';
import { validationSchemasState } from 'state/validationSchemasAtom';
import {
  getDefaultScanConfiguration,
  ScanConfiguration,
} from './ScanConfiguration';

import '@ui5/webcomponents-icons/dist/status-positive.js';
import { ScanResult } from './ScanResult';

export const ClusterValidation = () => {
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
    () => new ResourceLoader(relativeUrl => fetch({ relativeUrl }), undefined),
    [fetch],
  );
  const validationSchemas = useRecoilValue(validationSchemasState);
  const defaultPolicySet = usePolicySet();

  const { namespaces } = useAvailableNamespaces();

  const [resources, setResources] = useRecoilState(resourcesState);

  const listableResources = useMemo(() => {
    return resources?.filter(resource => resource.verbs?.includes('list'));
  }, [resources]);

  const scanReady = !!(validationSchemas && listableResources);

  useEffect(() => {
    if (!resources)
      resourceLoader.loadResourceLists().then(resourceList => {
        setResources(resourceList);
      });
  }, [resources, resourceLoader, setResources]);

  const defaultConfiguration = useMemo(
    () =>
      getDefaultScanConfiguration(namespaces, [...defaultPolicySet.values()]),
    [namespaces, defaultPolicySet],
  );

  const [
    selectedConfiguration,
    setConfiguration,
  ] = useState<ScanConfiguration | null>(null);
  const configuration = useMemo(
    () => selectedConfiguration ?? defaultConfiguration,
    [selectedConfiguration, defaultConfiguration],
  );
  const [isConfigurationOpen, setConfigurationOpen] = useState(false);
  const configure = () => {
    setConfigurationOpen(true);
  };

  const [currentScan, setCurrentScan] = useState<Scan | null>();

  const [scanResult, _setScanResult] = useState<ScanResult | null>();
  const setScanResult = (result: ScanResult | null) => {
    if (result) _setScanResult({ ...result });
    else _setScanResult(result);
  };

  const scanSettings = {
    concurrentRequests: configuration?.scanParameters?.parallelRequests ?? 5,
    concurrentWorkers: 1,
    backpressureBuffer: 3,
  };
  resourceLoader.queue.concurrency = Math.max(
    scanSettings.concurrentRequests,
    1,
  );

  const [scanProgress, setScanProgress] = useState<ScanProgress | null>();

  const scan = async () => {
    if (!validationSchemas || !listableResources) return;
    const enabledSchemas = getValidationEnabledSchemas(
      validationSchemas,
      new Set(configuration.policies),
    );
    const _currentScan = new Scan(resourceLoader, enabledSchemas);
    setCurrentScan(_currentScan);
    await ResourceValidation.setRuleset(enabledSchemas);

    const resourcesToScan = listableResources;

    await _currentScan.scan({
      namespaces: configuration?.namespaces,
      resources: resourcesToScan,
      setScanProgress,
      setScanResult,
      post,
      concurrency:
        Math.max(
          scanSettings.concurrentRequests,
          scanSettings.concurrentWorkers,
        ) + scanSettings.backpressureBuffer,
    });
  };

  const clear = () => {
    currentScan?.abort();
    setCurrentScan(null);
    setScanResult(null);
    setScanProgress(null);
  };

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header className="fd-has-padding-left-small fd-has-padding-right-small">
        <LayoutPanel.Head title={'Cluster Validation'} />
        <LayoutPanel.Actions>
          <Button
            className="fd-margin-end--tiny"
            icon="play"
            iconEnd
            onClick={scan}
            disabled={!!scanProgress || !scanReady}
          >
            {t('cluster-validation.scan.buttons.scan')}
          </Button>
          <Button
            className="fd-margin-end--tiny"
            icon="settings"
            iconEnd
            onClick={configure}
            disabled={!!scanProgress || !scanReady}
          >
            {t('cluster-validation.scan.buttons.configure')}
          </Button>
          <Button icon="reset" iconEnd onClick={clear} disabled={!scanProgress}>
            {t('cluster-validation.scan.buttons.clear')}
          </Button>
        </LayoutPanel.Actions>
      </LayoutPanel.Header>

      {!scanReady && (
        <LayoutPanel.Filters className="fd-has-padding-none">
          <Loader type="Indeterminate" />
        </LayoutPanel.Filters>
      )}

      <LayoutPanel.Body>
        <Section titleText={t('cluster-validation.scan.scope')}>
          <FlexBox className="fd-has-padding-small">
            <InfoTile
              title={t('common.headers.namespaces')}
              content={
                !configuration?.namespaces
                  ? '-'
                  : `${configuration?.namespaces?.length}`
              }
            />
            <InfoTile
              title={t('cluster-validation.scan.k8s-api-resources')}
              content={!listableResources ? '-' : `${listableResources.length}`}
            />
          </FlexBox>
        </Section>

        {scanProgress && (
          <Section
            titleText={t('cluster-validation.scan.progress')}
            status={
              scanProgress
                ? `${scanProgress.scanned ?? 0} / ${scanProgress.total ?? '?'}`
                : t('cluster-validation.scan.not-started')
            }
          >
            <ProgressIndicator
              value={
                scanProgress && scanProgress.total
                  ? Math.floor(
                      (100 * (scanProgress.scanned ?? 0)) / scanProgress.total,
                    )
                  : 0
              }
              valueState={
                scanProgress && scanProgress.total === scanProgress.scanned
                  ? 'Success'
                  : 'None'
              }
              style={{ width: '96%', padding: '5px 2%' }}
            />
          </Section>
        )}

        {scanResult && (
          <Section titleText={t('cluster-validation.scan.result')}>
            <ScanResultTree scanResult={scanResult} />
          </Section>
        )}

        <ClusterValidationConfigurationDialog
          show={isConfigurationOpen}
          onCancel={() => setConfigurationOpen(false)}
          onSubmit={(newConfiguration: ScanConfiguration) => {
            setConfiguration(newConfiguration);
            setConfigurationOpen(false);
          }}
          configuration={configuration}
          namespaces={namespaces}
          policies={validationSchemas?.policies.map(policy => policy.name)}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

const InfoTile = ({ title, content }: { title?: string; content?: string }) => {
  return (
    <Card
      header={<CardHeader titleText={title} subtitleText={content} />}
      style={{ width: 'fit-content', margin: '5px' }}
    ></Card>
  );
};

const Section = ({
  titleText,
  subtitleText,
  status,
  header,
  children,
}: {
  titleText?: string;
  subtitleText?: string;
  status?: string;
  header?: any;
  children?: any[] | any;
}) => {
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

export const ClusterValidationPanel = () => {
  return <ClusterValidation />;
};
