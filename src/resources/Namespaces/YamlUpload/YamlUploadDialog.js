import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Button } from '@ui5/webcomponents-react';
import { Dialog } from 'fundamental-react';
import { isEqual } from 'lodash';

import { YamlResourcesList } from './YamlResourcesList';
import { useUploadResources } from './useUploadResources';
import { Spinner } from 'shared/components/Spinner/Spinner';

import './YamlUploadDialog.scss';
import { useTranslation } from 'react-i18next';
import { useEventListener } from 'hooks/useEventListener';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

export const YamlUpload = React.lazy(() => import('./YamlUpload'));

export const OPERATION_STATE_INITIAL = 'INITIAL';
export const OPERATION_STATE_WAITING = 'WAITING';
export const OPERATION_STATE_SUCCEEDED = 'SUCCEEDED';
export const OPERATION_STATE_SOME_FAILED = 'SOME_FAILED';

export function YamlUploadDialog({ show, onCancel }) {
  const { t } = useTranslation();
  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const defaultNamespace = namespaceId || 'default';

  const [resourcesData, setResourcesData] = useState();
  const [resourcesWithStatuses, setResourcesWithStatuses] = useState();
  const [initialUnchangedResources, setInitialUnchangedResources] = useState(
    resourcesWithStatuses,
  );
  const oldYaml = useRef();
  const [lastOperationState, setLastOperationState] = useState(
    OPERATION_STATE_INITIAL,
  );

  useEffect(() => {
    if (!initialUnchangedResources?.length && resourcesWithStatuses?.length) {
      setInitialUnchangedResources(resourcesWithStatuses);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourcesWithStatuses]);

  const fetchResources = useUploadResources(
    resourcesWithStatuses,
    initialUnchangedResources,
    setResourcesWithStatuses,
    setLastOperationState,
    defaultNamespace,
  );

  useEventListener('keydown', ({ key }) => {
    if (key === 'Escape') {
      onCancel();
    }
  });

  useEffect(() => {
    if (!show) {
      setResourcesData(null);
      setResourcesWithStatuses(null);
      setInitialUnchangedResources(null);
      setLastOperationState(OPERATION_STATE_INITIAL);
      oldYaml.current = null;
    }
  }, [show]);

  const updateYamlContent = yaml => {
    if (isEqual(yaml?.sort(), oldYaml?.current?.sort())) return;
    setResourcesData(yaml);
    const nonEmptyResources = yaml?.filter(resource => resource !== null);
    const resourcesWithStatus = nonEmptyResources?.map(value => ({
      value,
      status: '',
      message: '',
    }));
    if (!initialUnchangedResources?.length && resourcesWithStatus?.length) {
      setInitialUnchangedResources(resourcesWithStatus);
    }
    setResourcesWithStatuses(resourcesWithStatus);
    oldYaml.current = yaml;
  };

  const actions = [
    lastOperationState === OPERATION_STATE_SUCCEEDED ? (
      <Button onClick={onCancel} design="Emphasized">
        {t('common.buttons.close')}
      </Button>
    ) : (
      <>
        <Button
          onClick={fetchResources}
          disabled={!resourcesWithStatuses?.length}
          design="Emphasized"
        >
          {t('common.buttons.submit')}
        </Button>
        <Button
          onClick={onCancel}
          design="Transparent"
          data-testid="yaml-cancel"
        >
          {lastOperationState !== OPERATION_STATE_SOME_FAILED
            ? t('common.buttons.cancel')
            : t('common.buttons.close')}
        </Button>
      </>
    ),
  ];

  return (
    <Dialog
      show={show}
      title={t('upload-yaml.title')}
      actions={actions}
      className="yaml-upload-modal"
    >
      <Suspense fallback={<Spinner />}>
        <div className="yaml-upload-modal__layout">
          <YamlUpload
            resourcesData={resourcesData}
            setResourcesData={updateYamlContent}
            setLastOperationState={setLastOperationState}
          />
          <div>
            <p className="fd-margin-begin--tiny" style={{ minHeight: '80px' }}>
              {t('upload-yaml.info', { namespace: defaultNamespace })}
            </p>
            <YamlResourcesList
              resourcesData={resourcesWithStatuses}
              namespace={namespaceId}
            />
          </div>
        </div>
      </Suspense>
    </Dialog>
  );
}

export default YamlUploadDialog;
