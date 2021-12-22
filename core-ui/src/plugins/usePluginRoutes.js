import { Route } from 'react-router-dom';
import { usePluginRegistry } from 'hooks/PluginRegistryContext';
import { useBusolaComponents } from 'hooks/BusolaComponentsContext';
import { useMicrofrontendContext } from 'react-shared';

export function usePluginRoutes() {
  const { language } = useMicrofrontendContext();
  const registry = usePluginRegistry();
  const busolaProps = useBusolaComponents();

  return registry
    .getByTags(['route'])
    .map(p => p.resolved)
    .flatMap(resolved =>
      resolved.createRoutes({
        Route,
        language,
        busolaProps,
      }),
    );
}
