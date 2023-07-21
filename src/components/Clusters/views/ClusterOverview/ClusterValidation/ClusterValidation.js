import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { createFetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  getValidationEnabledSchemas,
  usePolicySet,
} from 'state/validationEnabledSchemasAtom';
import { ResourceValidation } from './ResourceValidation';
import { Button, LayoutPanel } from 'fundamental-react';

import { ResourceLoader } from './ResourceLoader';
import { createPostFn } from 'shared/hooks/BackendAPI/usePost';
import { Scan } from './Scan';
import { ScanResultTree } from './ScanResultTree';
import PQueue from 'p-queue';
import { useAvailableNamespaces } from 'hooks/useAvailableNamespaces';
import {
  Card,
  CardHeader,
  FlexBox,
  ProgressIndicator,
} from '@ui5/webcomponents-react';
import { ClusterValidationConfigurationDialog } from './ClusterValidationConfiguration';
import { resourcesState } from 'state/resourcesAtom';

import { authDataState } from 'state/authDataAtom';
import { clusterState } from 'state/clusterAtom';
import { validationSchemasState } from 'state/validationSchemasAtom';
import { getDefaultScanConfiguration } from './ScanConfiguration';

import '@ui5/webcomponents-icons/dist/status-positive.js';

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
    () =>
      new ResourceLoader(
        relativeUrl => fetch({ relativeUrl }),
        undefined,
        null,
      ),
    [fetch],
  );
  const validationSchemas = useRecoilValue(validationSchemasState);
  const defaultPolicySet = usePolicySet();

  const { namespaces } = useAvailableNamespaces();

  const [resources, setResources] = useRecoilState(resourcesState);

  const listableResources = useMemo(() => {
    return resources?.filter(resource => resource.verbs?.includes('list'));
  }, [resources]);

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
    concurrentWorkers: 1,
    backpressureBuffer: 3,
  };
  resourceLoader.queue.concurrency = scanSettings.concurrentRequests;

  const [scanProgress, setScanProgress] = useState();

  const scan = async () => {
    setScanProgress({});
    const enabledSchemas = getValidationEnabledSchemas(
      validationSchemas,
      new Set(configuration.policies),
    );
    const currentScan = new Scan(resourceLoader, enabledSchemas);
    setScanResult(currentScan.result);
    await ResourceValidation.setRuleset(enabledSchemas);

    const resourcesToScan = listableResources;

    await currentScan.gatherAPIResources({
      namespaces: configuration?.namespaces,
      resources: resourcesToScan,
    });
    setScanResult(currentScan.result);

    await currentScan.checkPermissions(post);
    setScanResult(currentScan.result);

    currentScan.initSummary();
    currentScan.calculateFullSummary(currentScan.result.summary);
    setScanResult(currentScan.result);

    let countScanned = 0;
    const queue = new PQueue({
      concurrency:
        Math.max(
          scanSettings.concurrentRequests,
          scanSettings.concurrentWorkers,
        ) + scanSettings.backpressureBuffer,
    });
    const toScan = [...currentScan.listResourcesToScan()];
    setScanProgress({ total: toScan.length });

    await Promise.all(
      toScan.map(async resource =>
        queue.add(async () => {
          await currentScan.scanResource(resource);
          currentScan.recalculateSummary(resource.summary);
          countScanned++;
          setScanProgress({ total: toScan.length, scanned: countScanned });
          setScanResult(currentScan.result);
        }),
      ),
    );
  };

  const clear = () => {
    setScanResult();
    setScanProgress();
  };

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header className="fd-has-padding-left-small fd-has-padding-right-small">
        <LayoutPanel.Head title={'Cluster Validation'} />
        <LayoutPanel.Actions>
          <Button glyph="play" onClick={scan} disabled={!!scanProgress}>
            {t('cluster-validation.scan.buttons.scan')}
          </Button>
          <Button
            glyph="settings"
            onClick={configure}
            disabled={!!scanProgress}
          >
            {t('cluster-validation.scan.buttons.configure')}
          </Button>
          <Button glyph="reset" onClick={clear} disabled={!scanProgress}>
            {t('cluster-validation.scan.buttons.clear')}
          </Button>
        </LayoutPanel.Actions>
      </LayoutPanel.Header>

      <LayoutPanel.Body className="fd-has-padding-none">
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

        <Section titleText={t('cluster-validation.scan.scope')}>
          <FlexBox>
            <InfoTile
              title={t('common.headers.namespaces')}
              content={
                !configuration?.namespaces
                  ? '-'
                  : configuration?.namespaces?.length
              }
            />
            <InfoTile
              title={t('cluster-validation.scan.k8s-api-resources')}
              content={!listableResources ? '-' : listableResources.length}
            />
          </FlexBox>
        </Section>

        <Section titleText={t('cluster-validation.scan.result')}>
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
          policies={validationSchemas.policies.map(policy => policy.name)}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

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

export const ClusterValidationPanel = () => {
  return <ClusterValidation />;
};
