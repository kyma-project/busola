import { FUNCTION_SOURCE_TYPE } from '../../constants';

export const sourceTypes = {
  '': FUNCTION_SOURCE_TYPE.INLINE,
  git: FUNCTION_SOURCE_TYPE.GIT,
};

export const prettySourceType = (sourceType, t) =>
  t(sourceTypes[sourceType]) || t(sourceTypes['']);

export const isGitSourceType = sourceType => sourceType === 'git';
