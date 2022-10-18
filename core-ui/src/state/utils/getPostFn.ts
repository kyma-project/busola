import { getFetchFn } from './getFetchFn';
import { GetRecoilValue } from 'recoil';
import { createPostFn, PostFn } from '../../shared/hooks/BackendAPI/usePost';

export const getPostFn = (get: GetRecoilValue) => {
  const fetchFn = getFetchFn(get);
  if (!fetchFn) return null;

  const postFn: PostFn = createPostFn(fetchFn);
  return postFn;
};
