import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { UserManager } from 'oidc-client-ts';
import { useTranslation } from 'react-i18next';
import {
  clearIntendedPath,
  saveIntendedPath,
  toClusterRelative,
} from 'state/intendedPathAtom';

type NotifyError = (props: { content: string }) => void;

// Session-drop recovery. Saves the current path, redirects through the IdP,
// falls back to a toast if the redirect itself fails.
export function useReauthenticate({
  notifyError,
}: {
  notifyError?: NotifyError;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useCallback(
    async (userManager: UserManager, error?: Error) => {
      const fullPath =
        location.pathname + (location.search ? location.search : '');
      const relative = toClusterRelative(fullPath);
      if (relative) saveIntendedPath(relative);
      try {
        await userManager.clearStaleState();
        await userManager.signinRedirect();
      } catch (redirectError) {
        console.warn('Silent re-auth via IdP failed:', redirectError);
        // Otherwise a later cluster pick would reuse the stale path.
        clearIntendedPath();
        navigate('/clusters');
        const message = error?.message || t('common.errors.session-expired');
        notifyError?.({
          content: `${t('common.errors.session-not-renewed')} ${message}`,
        });
      }
    },
    [location.pathname, location.search, navigate, t, notifyError],
  );
}
