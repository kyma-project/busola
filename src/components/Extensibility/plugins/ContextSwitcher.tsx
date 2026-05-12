import { WidgetPluginProps } from '@ui-schema/react';

export function ContextSwitcher({ Next, ...props }: WidgetPluginProps) {
  return <Next.Component {...props} />;
}
