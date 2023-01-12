import { RecoilValueReadOnly, selector, noWait } from 'recoil';
import { openapiState } from './openapiSelector';

type OpenapiPathIdList = string[];

export const openapiPathIdListSelector: RecoilValueReadOnly<OpenapiPathIdList> = selector<
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
