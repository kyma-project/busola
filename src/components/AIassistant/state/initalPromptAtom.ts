import { atom, RecoilState } from 'recoil';

type InitalPrompt = string;

const DEFAULT_INITIAL_PROMPT = '';

export const initialPromptState: RecoilState<InitalPrompt> = atom<InitalPrompt>(
  {
    key: 'initialPromptState',
    default: DEFAULT_INITIAL_PROMPT,
  },
);
