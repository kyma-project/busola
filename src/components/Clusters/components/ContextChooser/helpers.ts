import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function getUserDetail(
  contextName: string,
  parameter: string,
  users?: Array<{ name: string; user: { exec: { args?: string[] } } }>,
) {
  const user = (users || []).find((user) => user.name === contextName);

  if (user?.user?.exec?.args === undefined) return null;

  const clientIDArg = (user.user.exec.args || []).find((arg) =>
    arg.startsWith(parameter),
  );
  return clientIDArg
    ? clientIDArg.replace(parameter, '')
    : EMPTY_TEXT_PLACEHOLDER;
}
