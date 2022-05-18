import { WidgetRenderer } from '@ui-schema/ui-schema/WidgetRenderer';

import {
  DefaultHandler,
  DependentHandler,
  ConditionalHandler,
  CombiningHandler,
  ReferencingHandler,
  ExtractStorePlugin,
} from '@ui-schema/ui-schema/Plugins';
import { PluginSimpleStack } from '@ui-schema/ui-schema/PluginSimpleStack';

import { WorkloadRenderer } from './WorkloadRenderer';
import { GenericListRenderer } from './GenericListRenderer';
import { SimpleTypeRenderer } from './SimpleTypeRenderer';

const pluginStack = [
  ReferencingHandler,
  ExtractStorePlugin,
  CombiningHandler,
  DefaultHandler,
  DependentHandler,
  ConditionalHandler,
  PluginSimpleStack,
];

export const widgets = {
  // ErrorFallback: ErrorFallback,
  RootRenderer: ({ children }) => <div>{children}</div>,
  GroupRenderer: ({ children }) => <div>{children}</div>,
  WidgetRenderer,
  pluginStack,
  types: {
    string: SimpleTypeRenderer,
    boolean: SimpleTypeRenderer,
    number: SimpleTypeRenderer,
    integer: SimpleTypeRenderer,
    array: GenericListRenderer,
  },
  custom: {
    /*
    Accordions: AccordionsRenderer,
    */
    Card: () => {},
    Workload: WorkloadRenderer,
    // List: GenericListRenderer,
    // Table: TableDataRenderer,
    /*
    Text: TextRenderer,
    StringIcon: StringIconRenderer,
    TextIcon: TextIconRenderer,
    NumberIcon: NumberIconRenderer,
    NumberSlider,
    SimpleList,
    GenericList,
    OptionsCheck,
    OptionsRadio,
    Select,
    SelectMulti,
    Card: CardRenderer,
    LabelBox,
    FormGroup,
    */
  },
};
export default widgets;
