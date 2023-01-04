import { selector, RecoilValue } from 'recoil';
import { getFetchFn } from 'state/utils/getFetchFn';

type OpenapiState = {
  swagger: string;
  paths: Record<string, any>;
} | null;

export const openapiState: RecoilValue<OpenapiState> = selector<OpenapiState>({
  key: 'openapiState',
  get: async ({ get }) => {
    const fetchFn = getFetchFn(get);
    if (!fetchFn) return null;

    try {
      const response = await fetchFn({ relativeUrl: '/openapi/v2' });
      return await response.json();
    } catch (e) {
      console.warn(e);
      return null;
    }
  },
});
