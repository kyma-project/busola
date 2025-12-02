import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

export function ContextSwitcher({ currentPluginIndex, ...props }) {
  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);
  // eslint-disable-next-line react-hooks/static-components
  return <Plugin {...props} currentPluginIndex={nextPluginIndex} />;
}
