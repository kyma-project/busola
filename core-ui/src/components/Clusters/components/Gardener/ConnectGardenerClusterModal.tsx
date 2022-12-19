import { useState } from 'react';
import { Modal } from 'shared/components/Modal/Modal';
import { useTranslation } from 'react-i18next';
import { Button } from 'fundamental-react';
import { performGardenerLogin } from './performGardenerLogin';
import { getClusterConfig } from 'state/utils/getBackendInfo';
import { useClustersInfo } from 'state/utils/getClustersInfo';

export function ConnectGardenerClusterModal({
  modalOpeningComponent,
}: {
  modalOpeningComponent: JSX.Element;
}) {
  const [kubeconfigText, setKubeconfigText] = useState('');
  const [report, setReport] = useState('');
  const { t } = useTranslation();
  const { backendAddress } = getClusterConfig();
  const clustersInfo = useClustersInfo();

  return (
    <Modal
      actions={(onClose: () => void) => [
        <Button onClick={onClose} key="close">
          {t('common.buttons.cancel')}
        </Button>,
      ]}
      title={t('clusters.gardener.title')}
      modalOpeningComponent={modalOpeningComponent}
    >
      <p className="fd-has-color-status-4 fd-has-font-style-italic">
        {t('clusters.gardener.enter-kubeconfig')}
      </p>
      <textarea
        onChange={e => setKubeconfigText(e.target.value)}
        value={kubeconfigText}
        style={{ minHeight: '200px', width: '70vw', marginTop: '0.5rem' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          disabled={!kubeconfigText}
          option="emphasized"
          onClick={async () => {
            try {
              await performGardenerLogin(
                kubeconfigText,
                setReport,
                backendAddress,
                clustersInfo,
              );
            } catch (e) {
              console.log(e);
              setReport('error: ' + (e as Error).message);
            }
            return false;
          }}
        >
          {t('clusters.gardener.connect')}
        </Button>
      </div>
      <div>{report}</div>
    </Modal>
  );
}
