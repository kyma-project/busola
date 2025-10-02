import { ReadableElapsedTimeFromNow } from 'shared/components/ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function TimeFromNow({ value }: { value: string }) {
  if (!value || value === EMPTY_TEXT_PLACEHOLDER) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  return <ReadableElapsedTimeFromNow timestamp={value} />;
}
