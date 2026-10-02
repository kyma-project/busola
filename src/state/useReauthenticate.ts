import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
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
  const location = useLocation();
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

      const fullPath =
        location.pathname + (location.search ? location.search : '');

      // If the API server keeps rejecting the token we would redirect forever,
      // so stop here and show the error instead.
      if (isAuthRedirectLoop()) {
        clearIntendedPath();
        // Clear the cluster so the login effect runs again on the next attempt.
        const clusterName = cluster?.name;
        setCluster(null);
        notifyLoginFailure(undefined, {
          // prompt: 'login' forces a fresh sign-in and returns the user to where they were.
          onRetry: () => {
            const relative = toClusterRelative(fullPath);
            if (relative) saveIntendedPath(relative);
            resetAuthRedirectGuard();
            if (userManager) {
              // Re-persist the cluster so the IdP callback (returns to the
              // origin, cluster atom already null) can restore it and finish.
              if (clusterName) persistActiveClusterName(clusterName);
              userManager
                .clearStaleState()
                .then(() => userManager.signinRedirect({ prompt: 'login' }))
                .catch(() => window.location.assign('/clusters'));
            } else {
              window.location.assign('/clusters');
            }
          },
        });
        navigate('/clusters');
        return;
      }

      const relative = toClusterRelative(fullPath);
      if (relative) saveIntendedPath(relative);
      try {
        if (!tryClaimReauthRedirect()) return;
        // Count the redirect so we can detect a loop when the IdP sends us back.
        registerAuthRedirect();
        await userManager.clearStaleState();
        await userManager.signinRedirect();
      } catch (redirectError) {
        console.warn('Silent re-auth via IdP failed:', redirectError);
        // We never left the page; release the claim.
        resetReauthRedirectClaim();
        clearIntendedPath();
        fallBackToClusterList();
      }
    },
    [
      location.pathname,
      location.search,
      navigate,
      t,
      notifyError,
      notifyLoginFailure,
      setCluster,
      cluster,
    ],
  );
}
