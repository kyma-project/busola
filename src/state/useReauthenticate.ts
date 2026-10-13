import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { UserManager } from 'oidc-client-ts';
import { useTranslation } from 'react-i18next';
import { clusterAtom, persistActiveClusterName } from 'state/clusterAtom';
import {
  clearIntendedPath,
  saveIntendedPath,
  toClusterRelative,
} from 'state/intendedPathAtom';
import {
  isAuthRedirectLoop,
  registerAuthRedirect,
  resetAuthRedirectGuard,
  resetReauthRedirectClaim,
  tryClaimReauthRedirect,
} from 'state/utils/authRedirectLoopGuard';
import { useNotifyLoginFailure } from './useLoginFailureNotification';

type NotifyError = (props: { content: string }) => void;

// Redirects through the IdP to recover a dropped session. Falls back to /clusters
// when there's no UserManager (token/cert/exec auth) or the redirect fails.
export function useReauthenticate({
  notifyError,
}: { notifyError?: NotifyError } = {}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cluster = useAtomValue(clusterAtom);
  const setCluster = useSetAtom(clusterAtom);
  const notifyLoginFailure = useNotifyLoginFailure();

  return useCallback(
    async (userManager: UserManager | null, error?: Error) => {
      const fallBackToClusterList = () => {
        navigate('/clusters');
        const message = error?.message || t('common.errors.session-expired');
        notifyError?.({
          content: `${t('common.errors.session-not-renewed')} ${message}`,
        });
      };

      if (!userManager) {
        fallBackToClusterList();
        return;
      }

      // useAuthHandler keeps this callback across navigations, so read the URL now.
      const relative = toClusterRelative(
        window.location.pathname + window.location.search,
      );

      // If the API server keeps rejecting the token we would redirect forever,
      // so stop here and show the error instead.
      if (isAuthRedirectLoop()) {
        clearIntendedPath();
        // Clear the cluster so the login effect runs again on the next attempt.
        const clusterName = cluster?.name;
        setCluster(null);
        notifyLoginFailure(undefined, {
          // prompt: 'login' so a stale IdP session can't send us straight back into the loop.
          onRetry: () => {
            if (relative) saveIntendedPath(relative);
            resetAuthRedirectGuard();
            // The cluster was cleared above; store its name so the login callback can restore it.
            if (clusterName) persistActiveClusterName(clusterName);
            userManager
              .clearStaleState()
              .then(() => userManager.signinRedirect({ prompt: 'login' }))
              .catch(() => window.location.assign('/clusters'));
          },
        });
        navigate('/clusters');
        return;
      }

      if (relative) saveIntendedPath(relative);
      try {
        if (!tryClaimReauthRedirect()) return;
        // Count the redirect so we can detect a loop when the IdP sends us back.
        registerAuthRedirect();
        await userManager.clearStaleState();
        await userManager.signinRedirect();
      } catch (redirectError) {
        console.warn('Silent re-auth via IdP failed:', redirectError);
        // Still on this page, so allow another attempt.
        resetReauthRedirectClaim();
        clearIntendedPath();
        fallBackToClusterList();
      }
    },
    [navigate, t, notifyError, notifyLoginFailure, setCluster, cluster],
  );
}
