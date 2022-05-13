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
import { ValidityReporter } from '@ui-schema/ui-schema/ValidityReporter';

import { GenericListRenderer } from './GenericListRenderer';
import { TableDataRenderer } from './TableDataRenderer';
import { SimpleTypeRenderer } from './simpleTypeRenderer';

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
    //    boolean: ({ children }) => <span>TODO: boolean</span>,
    number: SimpleTypeRenderer,
    integer: SimpleTypeRenderer,
    array: props => {
      console.log(props);

      return <>TODO: array</>;
    },
    // object: props => {
    //   console.log(props);
    //   return <>Siemaneczko</>;
    // },
    // object: ({ children }) => TableDataRenderer({ children }),
    // array: GenericListRenderer,
  },
  custom: {
    /*
    Accordions: AccordionsRenderer,
    */
    Workload: props => {
      console.log(props);
      return <>Siemaneczko</>;
    },
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
