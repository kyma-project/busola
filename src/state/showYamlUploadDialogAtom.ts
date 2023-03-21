import { atom, RecoilState } from 'recoil';

type ShowYamlUploadDialog = boolean;

const DEFAULT_SHOW_YAML_UPLOAOD_DIALOG = false;

export const showYamlUploadDialogState: RecoilState<ShowYamlUploadDialog> = atom<
  ShowYamlUploadDialog
>({
  key: 'showYamlUploadDialogState',
  default: DEFAULT_SHOW_YAML_UPLOAOD_DIALOG,
});
