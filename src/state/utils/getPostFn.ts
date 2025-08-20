import { getFetchFn } from './getFetchFn';
import { Getter } from 'jotai';
import { createPostFn, PostFn } from 'shared/hooks/BackendAPI/usePost';

export const getPostFn = (get: Getter) => {
  const fetchFn = getFetchFn(get);
  if (!fetchFn) return null;

  const postFn: PostFn = createPostFn(fetchFn);
  return postFn;
};
