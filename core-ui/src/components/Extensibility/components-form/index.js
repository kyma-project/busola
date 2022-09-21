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
import { validators } from '@ui-schema/ui-schema/Validators/validators';

import { SchemaRulesInjector } from '../plugins/SchemaRulesInjector';
import { EnumHandler } from '../plugins/EnumHandler';
import { VisibilityHandler } from '../plugins/VisibilityHandler';

import { StringRenderer } from './StringRenderer';
import { NumberRenderer } from './NumberRenderer';
import { SwitchRenderer } from './SwitchRenderer';
import { NameRenderer } from './NameRenderer';
import { KeyValuePairRenderer } from './KeyValuePairRenderer';
import { CollapsibleRenderer } from './CollapsibleRenderer';
import { GenericList } from './GenericList';
import { MonacoRenderer } from './MonacoRenderer';
import { ResourceRenderer } from './ResourceRenderer';
import { ResourceRefRender } from './ResourceRefRenderer';
import { SimpleList } from './SimpleList';
import { AlertRenderer } from './AlertRenderer';

const pluginStack = [
  ReferencingHandler,
  ExtractStorePlugin,
  CombiningHandler,
  DefaultHandler,
  DependentHandler,
  ConditionalHandler,
  SchemaRulesInjector,
  EnumHandler,
  VisibilityHandler,
  PluginSimpleStack,
  ValidityReporter,
];

export const widgets = {
  RootRenderer: ({ children }) => <div>{children}</div>,
  GroupRenderer: ({ children }) => children,
  WidgetRenderer,
  pluginStack,
  pluginSimpleStack: validators,
  types: {
    string: StringRenderer,
    boolean: SwitchRenderer,
    number: NumberRenderer,
    integer: NumberRenderer,
    array: GenericList,
  },
  custom: {
    /*
    Accordions: AccordionsRenderer,
    */
    Text: StringRenderer,
    /*
    Text: TextRenderer,
    StringIcon: StringIconRenderer,
    TextIcon: TextIconRenderer,
    NumberIcon: NumberIconRenderer,
    NumberSlider,
    */
    SimpleList,
    GenericList,
    /*
    OptionsCheck,
    OptionsRadio,
    Select,
    SelectMulti,
    Card: CardRenderer,
    LabelBox,
    */
    Name: NameRenderer,
    KeyValuePair: KeyValuePairRenderer,
    CodeEditor: MonacoRenderer,
    FormGroup: CollapsibleRenderer,
    ResourceRef: ResourceRefRender,
    Resource: ResourceRenderer,
    Message: AlertRenderer,
  },
};
export default widgets;
