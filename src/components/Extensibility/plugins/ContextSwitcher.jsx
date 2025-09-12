import React from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

export function ContextSwitcher({ currentPluginIndex, ...props }) {
  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  return <Plugin {...props} currentPluginIndex={nextPluginIndex} />;
}
