import { useConfig } from 'shared/contexts/ConfigContext';
import { configState } from 'state/configAtom';
import { useUpdateRecoilIfValueChanged } from 'components/App/useLuigiContextMigrator';

export const useConfigContextMigrator = () => {
  const config = useConfig();

  useUpdateRecoilIfValueChanged(config, configState);
};
