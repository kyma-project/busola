import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

type ValidateYaml = boolean;

const VALIDATE_YAML_STORAGE_KEY = 'busola.showHiddenNamespaces';
const DEFAULT_VALIDATE_YAML = true;

export const validateYamlState: RecoilState<ValidateYaml> = atom<ValidateYaml>({
  key: 'validateYamlState',
  default: DEFAULT_VALIDATE_YAML,
  effects: [localStorageEffect<ValidateYaml>(VALIDATE_YAML_STORAGE_KEY)],
});
