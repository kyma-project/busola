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
import { Switch2 } from 'components/Extensibility/components-form/Switch2';
import { String2 } from 'components/Extensibility/components-form/String2';
import { GenericList2 } from 'components/Extensibility/components-form/GenericList2';

export const widgetList = {
  string: String2,
  boolean: Switch2,
  number: NumberRenderer,
  integer: NumberRenderer,
  array: GenericList2,
};
//
// export const widgets = {
//   RootRenderer: ({ children }) => <div>{children}</div>,
//   GroupRenderer: ({ children }) => children,
//   WidgetRenderer,
//   pluginStack,
//   types: {
//     string: StringRenderer,
//     boolean: SwitchRenderer,
//     number: NumberRenderer,
//     integer: NumberRenderer,
//     array: GenericList,
//   },
//   custom: {
//     Null: () => '',
//     /*
//     Accordions: AccordionsRenderer,
//     */
//     Text: StringRenderer,
//     /*
//     Text: TextRenderer,
//     StringIcon: StringIconRenderer,
//     TextIcon: TextIconRenderer,
//     NumberIcon: NumberIconRenderer,
//     NumberSlider,
//     */
//     SimpleList,
//     GenericList,
//     /*
//     OptionsCheck,
//     OptionsRadio,
//     Select,
//     SelectMulti,
//     Card: CardRenderer,
//     LabelBox,
//     */
//     Name: NameRenderer,
//     KeyValuePair: KeyValuePairRenderer,
//     CodeEditor: MonacoRenderer,
//     FormGroup: CollapsibleRenderer,
//     ResourceRefs: ResourceRefRender,
//     Resource: ResourceRenderer,
//   },
// };
