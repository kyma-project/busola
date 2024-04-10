import { atom, RecoilState } from 'recoil';

type ShowAIassistant = {
  show: boolean;
  fullScreen: boolean;
};

const DEFAULT_SHOW_AI_ASSISTANT: ShowAIassistant = {
  show: false,
  fullScreen: false,
};

export const showAIassistantState: RecoilState<ShowAIassistant> = atom<
  ShowAIassistant
>({
  key: 'showAIassistantState',
  default: DEFAULT_SHOW_AI_ASSISTANT,
});
