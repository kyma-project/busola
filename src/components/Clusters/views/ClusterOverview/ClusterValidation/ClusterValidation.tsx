import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { createFetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { useAtomValue } from 'jotai';
import {
  getValidationEnabledSchemas,
  usePolicySet,
} from 'state/validationEnabledSchemasAtom';
import { ResourceValidation } from './ResourceValidation';

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
  ProgressIndicator,
} from '@ui5/webcomponents-react';
import { Loader } from '@ui5/webcomponents-react-compat/dist/components/Loader/index.js';
import { ClusterValidationConfigurationDialog } from './ClusterValidationConfiguration';

import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { validationSchemasAtom } from 'state/validationSchemasAtom';
import {
  getDefaultScanConfiguration,
  ScanConfiguration,
} from './ScanConfiguration';

import '@ui5/webcomponents-icons/dist/status-positive.js';
import { ScanResult } from './ScanResult';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { createPortal } from 'react-dom';
import { K8sAPIResource } from 'types';

export const ClusterValidation = () => {
  const { t } = useTranslation();

  const authData = useAtomValue(authDataAtom);
  const cluster = useAtomValue(clusterAtom);

  const { fetch, post } = useMemo(() => {
    const fetch = createFetchFn({
      authData,
      cluster,
    });
    const post = createPostFn(fetch);
    return { fetch, post };
  }, [authData, cluster]);

  const defaultPolicySet = usePolicySet();
  const { namespaces } = useAvailableNamespaces();

  const defaultConfiguration = useMemo(
    () =>
      getDefaultScanConfiguration(namespaces, [...defaultPolicySet.values()]),
    [namespaces, defaultPolicySet],
  );

  const [selectedConfiguration, setConfiguration] =
    useState<ScanConfiguration | null>(null);

  const configuration = useMemo(
    () => selectedConfiguration ?? defaultConfiguration,
    [selectedConfiguration, defaultConfiguration],
  );

  const scanSettings = useMemo(() => {
    return {
      concurrentRequests: configuration?.scanParameters?.parallelRequests ?? 5,
      concurrentWorkers: 1,
      backpressureBuffer: 3,
    };
  }, [configuration?.scanParameters?.parallelRequests]);

  const resourceLoader = useMemo(
    () =>
      new ResourceLoader(
        (relativeUrl) => fetch({ relativeUrl }),
        Math.max(scanSettings.concurrentRequests, 1),
      ),
    [fetch, scanSettings.concurrentRequests],
  );
  const validationSchemas = useAtomValue(validationSchemasAtom);

  const [resources, setResources] = useState<K8sAPIResource[] | null>(null);

  const listableResources = useMemo(() => {
    return resources?.filter((resource) => resource.verbs?.includes('list'));
  }, [resources]);

  const scanReady = !!(validationSchemas && listableResources);

  useEffect(() => {
    if (!resources)
      resourceLoader.loadResourceLists().then((resourceList) => {
        setResources(resourceList);
      });
  }, [resources, resourceLoader, setResources]);

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

    await _currentScan.scan({
      namespaces: configuration?.namespaces,
      resources: listableResources,
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
    <UI5Panel
      keyComponent="cluster-validation"
      title={t('cluster-validation.title')}
      headerActions={
        <>
          <Button
            endIcon="play"
            onClick={scan}
            disabled={!!scanProgress || !scanReady}
          >
            {t('cluster-validation.scan.buttons.scan')}
          </Button>
          <Button
            endIcon="settings"
            onClick={configure}
            disabled={!!scanProgress || !scanReady}
          >
            {t('cluster-validation.scan.buttons.configure')}
          </Button>
          <Button endIcon="reset" onClick={clear} disabled={!scanProgress}>
            {t('cluster-validation.scan.buttons.clear')}
          </Button>
        </>
      }
    >
      {!scanReady && <Loader type="Indeterminate" />}

      <Section titleText={t('cluster-validation.scan.scope')}>
        <FlexBox className="sap-margin-small">
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
                ? 'Positive'
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
      {createPortal(
        <ClusterValidationConfigurationDialog
          show={isConfigurationOpen}
          onCancel={() => setConfigurationOpen(false)}
          onSubmit={(newConfiguration: ScanConfiguration) => {
            setConfiguration(newConfiguration);
            setConfigurationOpen(false);
          }}
          configuration={configuration}
          namespaces={namespaces}
          policies={validationSchemas?.policies.map((policy) => policy.name)}
        />,
        document.body,
      )}
    </UI5Panel>
  );
};

const InfoTile = ({ title, content }: { title?: string; content?: string }) => {
  return (
    <Card
      accessibleName={title}
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
        accessibleName={titleText}
        header={
          (titleText ?? subtitleText ?? status) ? (
            <CardHeader
              titleText={titleText}
              subtitleText={subtitleText}
              additionalText={status}
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
