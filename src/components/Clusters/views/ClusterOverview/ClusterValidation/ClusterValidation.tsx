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
import {
  getDefaultScanConfiguration,
  ScanConfiguration,
} from './ScanConfiguration';

import '@ui5/webcomponents-icons/dist/status-positive.js';
import { ScanResult } from './ScanResult';

type ScanProgress =
  | {
      total?: number;
      scanned?: number;
    }
  | undefined;

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
    if (currentScan.result.summary)
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
          if (resource.summary)
            currentScan.recalculateSummary(resource.summary);
          countScanned++;
          setScanProgress({ total: toScan.length, scanned: countScanned });
          setScanResult(currentScan.result);
        }),
      ),
    );
  };

  const clear = () => {
    setScanResult(null);
    setScanProgress(null);
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

        <Section titleText={t('cluster-validation.scan.scope')}>
          <FlexBox>
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

        <Section titleText={t('cluster-validation.scan.result')}>
          <ScanResultTree scanResult={scanResult} />
        </Section>

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
