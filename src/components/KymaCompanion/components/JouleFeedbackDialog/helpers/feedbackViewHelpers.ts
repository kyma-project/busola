export const SHOW_FEEDBACK_STORAGE_KEY = 'show-feedback-status';

export const FEEDBACK_SHOW_TYPE = {
  NO_SHOW: 'NO_SHOW', //AI chat feedback already viewed or dissmissed twice
  DISMISSED_ONCE: 'DISMISSED_ONCE', //AI chat feedback dismissed once
  SHOW: 'SHOW', //AI chat feedback not yet viewed
} as const;

export type FEEDBACK_SHOW_TYPE =
  (typeof FEEDBACK_SHOW_TYPE)[keyof typeof FEEDBACK_SHOW_TYPE];

export const getShowFeedbackStorageKey = () => {
  return (localStorage.getItem(SHOW_FEEDBACK_STORAGE_KEY) ||
    FEEDBACK_SHOW_TYPE.SHOW) as FEEDBACK_SHOW_TYPE;
};

export const dismissFeedbackRequestFirstTime = () => {
  localStorage.setItem(
    SHOW_FEEDBACK_STORAGE_KEY,
    FEEDBACK_SHOW_TYPE.DISMISSED_ONCE,
  );
};

export const setNoFeedbackShowNextTime = () => {
  localStorage.setItem(SHOW_FEEDBACK_STORAGE_KEY, FEEDBACK_SHOW_TYPE.NO_SHOW);
};
