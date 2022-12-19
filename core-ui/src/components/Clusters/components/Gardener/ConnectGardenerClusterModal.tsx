import { useState } from 'react';
import { Modal } from 'shared/components/Modal/Modal';
import { useTranslation } from 'react-i18next';
import { MessageStrip } from 'fundamental-react';
import { useGardenerLogin } from './useGardenerLogin';

export function ConnectGardenerClusterModal({
  modalOpeningComponent,
}: {
  modalOpeningComponent: JSX.Element;
}) {
  const [kubeconfigText, setKubeconfigText] = useState('');
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  const [isFetching, setFetching] = useState(false);
  const { t } = useTranslation();
  const performGardenerLogin = useGardenerLogin(setReport);

  return (
    <Modal
      title={t('clusters.gardener.title')}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={t('clusters.gardener.connect')}
      cancelText={t('common.buttons.cancel')}
      disabledConfirm={!kubeconfigText || isFetching}
      onConfirm={async () => {
        setError('');
        setFetching(true);
        try {
          await performGardenerLogin(kubeconfigText);
        } catch (e) {
          console.log(e);
          setError(
            t('clusters.gardener.error', { message: (e as Error).message }),
          );
          return false;
        } finally {
          setFetching(false);
        }
      }}
      disableAutoClose
      onShow={() => {
        setReport('');
        setError('');
        setKubeconfigText('');
      }}
    >
      <p className="fd-has-color-status-4 fd-has-font-style-italic">
        {t('clusters.gardener.enter-kubeconfig')}
      </p>
      <textarea
        onChange={e => setKubeconfigText(e.target.value)}
        value={kubeconfigText}
        className="fd-margin-top--tiny"
        style={{ minHeight: '200px', width: '70vw' }}
      />
      {report && (
        <MessageStrip type="information" className="fd-margin-top--sm">
          {report}
        </MessageStrip>
      )}
      {error && (
        <MessageStrip type="error" className="fd-margin-top--sm">
          {error}
        </MessageStrip>
      )}
    </Modal>
  );
}
