import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';

import { CONFIG } from 'components/Lambdas/config';

const CMF_LOGS_PATH = '/home/logs';

function runFnOnContextUpdate(url, cleanupFn) {
  if (url !== window.location.pathname) {
    cleanupFn();
  }
  LuigiClient.removeContextUpdateListener(runFnOnContextUpdate);
}

export const useLogsView = (uid, namespace, initialCollapse = true) => {
  const [logsViewExists, setLogViewExists] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const {
      jobContainerName,
      deploymentContainerName,
      repoFetcherContainerName,
    } = CONFIG.logging;

    const linkManager = LuigiClient.linkManager().withParams({
      namespace: namespace,
      functionUID: uid,
      compact: 'true',
      container: `~(${jobContainerName}|${deploymentContainerName}|${repoFetcherContainerName})`,
    });

    checkLogsViewExists(linkManager, setLogViewExists);

    let logsViewHandle;
    if (logsViewExists) {
      logsViewHandle = openLogsView(linkManager, initialCollapse, t);
    }

    const cleanup = () => {
      // workaround for destroy splitView with navigation from details to list view
      // close doesn't work with collapsed state, so first expand and then close
      logsViewHandle && logsViewHandle.expand();
      logsViewHandle && logsViewHandle.close();
    };

    // when user switches to another MF, useEffects's cleanup
    // function may not be fired - detect it manually
    LuigiClient.addContextUpdateListener(() =>
      runFnOnContextUpdate(window.location.pathname, cleanup),
    );

    return cleanup;
  }, [namespace, uid, logsViewExists, initialCollapse, t]);
};

const checkLogsViewExists = async (manager, setViewExists) => {
  try {
    const exists = await manager.pathExists(CMF_LOGS_PATH);
    setViewExists(exists);
  } catch (err) {
    console.error(err);
    setViewExists(false);
  }
};

const openLogsView = (manager, initialCollapse, t) => {
  return manager.openAsSplitView(CMF_LOGS_PATH, {
    title: t('common.headers.logs'),
    size: 40,
    collapsed: initialCollapse,
  });
};
