import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useFeature } from 'hooks/useFeature';
import {
  configFeaturesNames,
  TerminalFeature as TerminalFeatureConfig,
} from 'state/types';
import { ShellBarAction } from './ShellBarAction';
import { useLaunchTerminal } from 'components/App/BusolaTerminal/useLaunchTerminal';
import { useAtomValue } from 'jotai';
import { authDataAtom } from 'state/authDataAtom';

export function TerminalFeature() {
  const { t } = useTranslation();
  const { isEnabled: isTerminalEnabled } = useFeature<TerminalFeatureConfig>(
    configFeaturesNames.TERMINAL,
  );
  const authData = useAtomValue(authDataAtom);
  const location = useLocation();
  const isOnClustersPage = location.pathname === '/clusters';
  const launch = useLaunchTerminal();

  if (!isTerminalEnabled || isOnClustersPage || !authData) return null;

  return (
    <ShellBarAction
      icon="command-line-interfaces"
      text={t('terminal.name')}
      title={t('terminal.name')}
      onClick={launch}
    />
  );
}
