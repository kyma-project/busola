import { RecoilValueReadOnly, selector } from 'recoil';
import { openapiState } from './openapiAtom';

type OpenapiPathIdList = string[] | null;

export const openapiPathIdListSelector: RecoilValueReadOnly<OpenapiPathIdList> = selector<
  OpenapiPathIdList
>({
  key: 'openapiPathIdList',
  get: ({ get }) => {
    const paths = get(openapiState)?.paths;

    if (paths) {
      const openapiPathIdList = Object.keys(paths);
      return openapiPathIdList;
    } else return null;
  },
});
