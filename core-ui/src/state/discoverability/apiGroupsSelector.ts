import { selector, RecoilValue } from 'recoil';
import { getFetchFn } from 'state/utils/getFetchFn';

export type ApiGroupState =
  | {
      name: string;
      preferredVersion: { groupVersion: string; version: string };
      versions: { groupVersion: string; version: string }[];
    }[]
  | null;

export const apiGroupState: RecoilValue<ApiGroupState> = selector<
  ApiGroupState
>({
  key: 'apigroupstate',
  get: async ({ get }) => {
    const fetchFn = getFetchFn(get);
    if (!fetchFn) return null;

    try {
      const response = await fetchFn({ relativeUrl: '/apis' });
      return (await response.json()).groups;
    } catch (e) {
      console.warn(e);
      return null;
    }
  },
});
