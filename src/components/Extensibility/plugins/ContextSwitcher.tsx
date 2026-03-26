import { WidgetProps, WidgetsBindingFactory } from '@ui-schema/ui-schema';
import {
  ComponentPluginType,
  getNextPlugin,
} from '@ui-schema/ui-schema/PluginStack';

export function ContextSwitcher({
  currentPluginIndex,
  ...props
}: { currentPluginIndex: number } & WidgetProps) {
  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(
    nextPluginIndex,
    props.widgets,
  ) as ComponentPluginType<Record<string, any>, WidgetsBindingFactory>;

  return <Plugin {...props} currentPluginIndex={nextPluginIndex} />;
}
