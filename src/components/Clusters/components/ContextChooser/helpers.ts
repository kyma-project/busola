import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { KubeconfigOIDCAuth, KubeconfigUser, NestedPartial } from 'types';

export function getUserDetail(
  contextName: string,
  parameter: string,
  users?: Array<NestedPartial<KubeconfigUser>>,
) {
  const user = (users || []).find((user) => user.name === contextName);
  const exec = (user?.user as NestedPartial<KubeconfigOIDCAuth> | undefined)
    ?.exec;

  if (exec?.args === undefined) return null;

  const clientIDArg = (exec.args || []).find((arg) =>
    arg?.startsWith(parameter),
  );
  return clientIDArg
    ? clientIDArg.replace(parameter, '')
    : EMPTY_TEXT_PLACEHOLDER;
}
