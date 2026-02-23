import {
  Children,
  cloneElement,
  DetailedReactHTMLElement,
  FunctionComponent,
  ReactNode,
} from 'react';
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
import { CustomFieldInjector } from '../plugins/CustomFieldInjector';
import { EnumHandler } from '../plugins/EnumHandler';
import { VisibilityHandler } from '../plugins/VisibilityHandler';
import { TriggerHandler } from '../plugins/TriggerHandler';
// TODO
// import { ContextSwitcher } from '../plugins/ContextSwitcher';

import { Jsonata } from './Jsonata';
import { StringRenderer } from './StringRenderer';
import { NumberRenderer } from './NumberRenderer';
import { SwitchRenderer } from './SwitchRenderer';
import { NameRenderer } from './NameRenderer';
import { KeyValuePairRenderer } from './KeyValuePairRenderer';
import { FormGroup } from './FormGroup';
import { GenericList } from './GenericList';
import { MonacoRenderer } from './MonacoRenderer';
import { ResourceRenderer } from './ResourceRenderer';
import { ResourceRefRender } from './ResourceRefRenderer';
import { SimpleList } from './SimpleList';
import { AlertRenderer } from './AlertRenderer';
import { MultiCheckbox } from './MultiCheckbox';
import { MultiType } from './MultiType';
import { Modules } from './Modules/Modules';
import { StoreSchemaType } from '@ui-schema/ui-schema';

const pluginStack = [
  // TODO
  // ContextSwitcher,
  ReferencingHandler,
  ExtractStorePlugin,
  CombiningHandler,
  DefaultHandler,
  DependentHandler,
  ConditionalHandler,
  SchemaRulesInjector,
  CustomFieldInjector,
  EnumHandler,
  TriggerHandler,
  VisibilityHandler,
  PluginSimpleStack,
  ValidityReporter,
];

export const widgets = {
  RootRenderer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  GroupRenderer: ({ children }: { children: ReactNode }) => (
    <>
      {Children.map(children, (child, i) =>
        cloneElement(child as DetailedReactHTMLElement<any, HTMLElement>, {
          key: `group-child-${i}`,
        }),
      )}
    </>
  ),
  WidgetRenderer: ({
    schema,
    required,
    ...props
  }: {
    schema: StoreSchemaType;
    required: boolean;
  } & Record<string, any>) => {
    required = schema.get('required') ?? required;
    return (WidgetRenderer as FunctionComponent<any>)({
      schema,
      required,
      ...props,
    });
  },
  pluginStack,
  pluginSimpleStack: validators.filter(Boolean),
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
    Switch: SwitchRenderer,
    Number: NumberRenderer,
    Jsonata,
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
    FormGroup,
    ResourceRef: ResourceRefRender,
    Resource: ResourceRenderer,
    Alert: AlertRenderer,
    MultiCheckbox,
    MultiType,
    Modules,
  },
};
export default widgets;
export const limitedWidgets = {
  ...widgets,
  pluginSimpleStack: widgets.pluginSimpleStack.filter(Boolean),
  pluginStack: [
    ReferencingHandler,
    ExtractStorePlugin,
    CombiningHandler,
    DefaultHandler,
    DependentHandler,
    ConditionalHandler,
    EnumHandler,
    PluginSimpleStack,
  ],
};
