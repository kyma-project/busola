import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { useLocation } from 'react-router';
import { useFeature } from 'hooks/useFeature';
import { showTerminalAtom } from 'state/showTerminalAtom';
import { configFeaturesNames } from 'state/types';
import { ShellBarAction } from './ShellBarAction';

export function TerminalFeature() {
  const { t } = useTranslation();
  const setShowTerminal = useSetAtom(showTerminalAtom);
  const { isEnabled: isTerminalEnabled } = useFeature(
    configFeaturesNames.TERMINAL,
  );
  const location = useLocation();
  const isOnClustersPage = location.pathname === '/clusters';

  if (!isTerminalEnabled || isOnClustersPage) return null;

  return (
    <ShellBarAction
      icon="command-line-interfaces"
      text={t('terminal.name')}
      title={t('terminal.name')}
      onClick={() =>
        setShowTerminal((prev) => ({ ...prev, isOpen: !prev.isOpen }))
      }
    />
  );
}
