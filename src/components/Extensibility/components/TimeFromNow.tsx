import {
  ReadableElapsedTimeFromNow,
  ROUNDING_RESULT_TYPE,
} from 'shared/components/ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function TimeFromNow({
  value,
  roundingResultType,
}: {
  value: string;
  roundingResultType?: ROUNDING_RESULT_TYPE;
}) {
  if (!value || value === EMPTY_TEXT_PLACEHOLDER) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  return (
    <ReadableElapsedTimeFromNow
      timestamp={value}
      roundingResultType={roundingResultType}
    />
  );
}
