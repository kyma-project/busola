import { LAMBDA_PHASES } from 'components/Lambdas/constants';

export function statusType(phase = LAMBDA_PHASES.INITIALIZING) {
  switch (phase) {
    case LAMBDA_PHASES.FAILED:
    case LAMBDA_PHASES.NEW_REVISION_ERROR:
      return 'error';
    case LAMBDA_PHASES.RUNNING:
      return 'success';
    case LAMBDA_PHASES.INITIALIZING:
      return 'info';
    default:
      return 'warning';
  }
}
