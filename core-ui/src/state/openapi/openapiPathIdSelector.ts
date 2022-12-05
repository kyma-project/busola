import { RecoilValueReadOnly, selector } from 'recoil';
import { openapiState } from './openapiAtom';

type OpenapiPathIdList = string[];

export const openapiPathIdListSelector: RecoilValueReadOnly<OpenapiPathIdList> = selector<
  OpenapiPathIdList
>({
  key: 'openapiPathIdList',
  get: ({ get }) => {
    const openapi = get(openapiState);

    if (openapi?.paths) {
      const openapiPathIdList = Object.keys(openapi.paths);
      return openapiPathIdList;
    }
    return [];
  },
});
