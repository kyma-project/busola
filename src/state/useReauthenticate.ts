import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useSetAtom } from 'jotai';
import { UserManager } from 'oidc-client-ts';
import { useTranslation } from 'react-i18next';
import { clusterAtom } from 'state/clusterAtom';
import {
  clearIntendedPath,
  saveIntendedPath,
  toClusterRelative,
} from 'state/intendedPathAtom';
import {
  isAuthRedirectLoop,
  registerAuthRedirect,
  resetAuthRedirectGuard,
} from 'state/utils/authRedirectLoopGuard';
import { useNotifyLoginFailure } from './useLoginFailureNotification';

type NotifyError = (props: { content: string }) => void;

// Session-drop recovery. With a UserManager, saves the current path and
// redirects through the IdP. Without one (token/cert/exec auth — no IdP
// round-trip possible) or when the redirect fails, falls back to the
// cluster list instead, so no call site is left on a dead cluster page.
export function useReauthenticate({
  notifyError,
}: { notifyError?: NotifyError } = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        setCluster(null);
        notifyLoginFailure(undefined, {
          onRetry: () => {
            resetAuthRedirectGuard();
            navigate(fullPath);
          },
        });
        navigate('/clusters');
        return;
      }

      const relative = toClusterRelative(fullPath);
      if (relative) saveIntendedPath(relative);
      try {
        // Count the redirect so we can detect a loop when the IdP sends us back.
        registerAuthRedirect();
        await userManager.clearStaleState();
        await userManager.signinRedirect();
      } catch (redirectError) {
        console.warn('Silent re-auth via IdP failed:', redirectError);
        // Otherwise a later cluster pick would reuse the stale path.
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
    ],
  );
}
