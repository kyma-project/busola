import { atom, RecoilState } from 'recoil';

type ShowAIassistant = boolean;

const DEFAULT_SHOW_AI_ASSISTANT = false;

export const showAIassistantState: RecoilState<ShowAIassistant> = atom<
  ShowAIassistant
>({
  key: 'showAIassistantState',
  default: DEFAULT_SHOW_AI_ASSISTANT,
});
