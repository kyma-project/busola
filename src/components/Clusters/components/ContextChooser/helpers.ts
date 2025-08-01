import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function getUserDetail(
  contextName: string,
  parameter: string,
  users?: Array<{ name: string; user: { exec: { args?: string[] } } }>,
) {
  const user = (users || []).find(user => user.name === contextName);
  if (user && user.user) {
    const clientIDArg = (user.user.exec.args || []).find(arg =>
      arg.startsWith(parameter),
    );
    return clientIDArg
      ? clientIDArg.replace(parameter, '')
      : EMPTY_TEXT_PLACEHOLDER;
  }
  return EMPTY_TEXT_PLACEHOLDER;
}
