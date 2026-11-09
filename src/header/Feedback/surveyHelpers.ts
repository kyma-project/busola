export const CLOUD_SERVICE_SURVEY_VIEWED_KEY = 'cloud-service-survey-viewed';
export const KYMA_SURVEY_VIEWED_KEY = 'kyma-survey-viewed';

export const isSurveyViewed = (key: string): boolean => {
  return localStorage.getItem(key) === 'true';
};

export const markSurveyViewed = (key: string): void => {
  localStorage.setItem(key, 'true');
};
