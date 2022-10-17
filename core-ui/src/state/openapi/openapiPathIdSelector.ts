import { selector } from 'recoil';
import { openapiState } from './openapiAtom';

export const openapiPathIdListSelector = selector({
  key: 'openapiPathIdList',
  get: ({ get }) => {
    const paths = get(openapiState)?.paths || {};
    const openapiPathIdList = Object.keys(paths);
    return openapiPathIdList;
  },
});
