import { FUNCTION_PHASES } from 'components/Functions/constants';

export function statusType(phase = FUNCTION_PHASES.INITIALIZING) {
  switch (phase) {
    case FUNCTION_PHASES.FAILED:
    case FUNCTION_PHASES.NEW_REVISION_ERROR:
      return 'error';
    case FUNCTION_PHASES.RUNNING:
      return 'success';
    case FUNCTION_PHASES.INITIALIZING:
      return 'info';
    default:
      return 'warning';
  }
}
