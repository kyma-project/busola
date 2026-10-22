import { provisionPod } from './provisionPod';
import { ConnectionType } from 'state/terminalSessionAtom';

export const TERMINAL_CONTAINER_NAME = 'dev-toolbox';
export const TERMINAL_NAMESPACE_NAME = 'busola-terminal';

export async function createBusolaTerminalPod(
  fetchFn,
  setSession,
  image,
  podName,
) {
  console.log('Provision pod', podName, image);
  const abort = new AbortController();

  try {
    await provisionPod({
      fetchFn,
      podName,
      image,
      abortController: abort,
    });
  } catch (e) {
    console.log(e);
    // If the reconnection is not in active phase, throw hard error
    // if (attemptRef.current === 0) {
    throw e;
    // }
    // console.warn(e);
  }

  setSession({
    connectionType: ConnectionType.Attach,
    podName: podName,
    container: TERMINAL_CONTAINER_NAME,
    namespace: TERMINAL_NAMESPACE_NAME,
    command: 'bash',
    status: 'provisioning',
  });
}
export async function deprovisonBusolaTerminal() {
  try {
    await fetchFn({
      relativeUrl: `/api/v1/namespaces/${TERMINAL_NAMESPACE_NAME}/pods/${podName}`,
      init: { method: 'DELETE' },
    });
  } catch {
    // best-effort
  }
}
