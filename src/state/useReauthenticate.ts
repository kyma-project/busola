import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { UserManager } from 'oidc-client-ts';
import { useTranslation } from 'react-i18next';
import { saveIntendedPath } from 'state/intendedPathAtom';

type NotifyError = (props: { content: string }) => void;

// Shared session-drop recovery: save the current path, redirect through the
// IdP, return to the same URL. Toast only if the redirect itself fails.
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
      saveIntendedPath(fullPath);
      try {
        await userManager.clearStaleState();
        await userManager.signinRedirect();
      } catch (redirectError) {
        console.warn('Silent re-auth via IdP failed:', redirectError);
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
