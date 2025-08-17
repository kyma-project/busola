import { RecoilValueReadOnly, selector, noWait } from 'recoil';
import { openapiState } from './openapiAtom';

export const openapiPathIdListSelector: RecoilValueReadOnly<string[]> = selector<
  OpenapiPathIdList
>({
  key: 'openapiPathIdList',
  get: ({ get }) => {
    const openApi = get(noWait(openapiState));

    if (openApi.state === 'hasValue') {
      const openapiPathIdList = Object.keys(openApi.contents?.paths ?? {});
      return openapiPathIdList;
    }
    return [];
  },
});
