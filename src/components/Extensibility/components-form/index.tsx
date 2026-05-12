import {
  Children,
  cloneElement,
  DetailedReactHTMLElement,
  FunctionComponent,
  ReactNode,
} from 'react';
import { WidgetRenderer } from '@ui-schema/react/WidgetRenderer';

import { DefaultHandler } from '@ui-schema/react/DefaultHandler';
import { DependentHandler } from '@ui-schema/react/DependentHandler';
import { ConditionalHandler } from '@ui-schema/react/ConditionalHandler';
import { CombiningHandler } from '@ui-schema/react/CombiningHandler';
import { ReferencingHandler } from '@ui-schema/react/ReferencingHandler';
import { ExtractStorePlugin } from '@ui-schema/react/ExtractStorePlugin';
import { ValidityReporter } from '@ui-schema/react/ValidityReporter';
import { ObjectRenderer } from '@ui-schema/react/ObjectRenderer';
import { schemaPluginsAdapterBuilder } from '@ui-schema/react/SchemaPluginsAdapter';
import { validatorPlugin } from '@ui-schema/json-schema/ValidatorPlugin';

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
import { BindingTypeGeneric } from '@ui-schema/react';
import { SomeSchema } from '@ui-schema/ui-schema';

const SchemaPluginsAdapter = schemaPluginsAdapterBuilder([validatorPlugin]);

const widgetPlugins = [
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
  SchemaPluginsAdapter,
  ValidityReporter,
];

export const widgets: BindingTypeGeneric = {
  GroupRenderer: ({ children }: { children: ReactNode }) => (
    <>
      {Children.map(children, (child, i) =>
        cloneElement(child as DetailedReactHTMLElement<any, HTMLElement>, {
          key: `group-child-${i}`,
        }),
      )}
    </>
  ),
  WidgetRenderer: (({
    schema,
    required,
    ...props
  }: {
    schema: SomeSchema;
    required: boolean;
  } & Record<string, any>) => {
    required = schema.get('required') ?? required;
    return (WidgetRenderer as FunctionComponent<any>)({
      schema,
      required,
      ...props,
    });
  }) as any,
  widgetPlugins,
  widgets: {
    // type-based widgets
    object: ObjectRenderer,
    string: StringRenderer,
    boolean: SwitchRenderer,
    number: NumberRenderer,
    integer: NumberRenderer,
    array: GenericList,
    // custom widgets
    Text: StringRenderer,
    Switch: SwitchRenderer,
    Number: NumberRenderer,
    Jsonata,
    SimpleList,
    GenericList,
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
export const limitedWidgets: BindingTypeGeneric = {
  ...widgets,
  widgetPlugins: [
    ReferencingHandler,
    ExtractStorePlugin,
    CombiningHandler,
    DefaultHandler,
    DependentHandler,
    ConditionalHandler,
    EnumHandler,
    SchemaPluginsAdapter,
  ],
};
