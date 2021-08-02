import { useState } from 'react';
import LuigiClient from '@luigi-project/client';

export function getFeatureToggle(key) {
  return (LuigiClient.getActiveFeatureToggles() || []).includes(key);
}
export function useFeatureToggle(key) {
  return useState(getFeatureToggle(key));
}
