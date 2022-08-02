import { StringRenderer } from './StringRenderer';
import { NumberRenderer } from './NumberRenderer';
import { NameRenderer } from './NameRenderer';
import { KeyValuePairRenderer } from './KeyValuePairRenderer';
import { CollapsibleRenderer } from './CollapsibleRenderer';
import { GenericList } from './GenericList';
import { MonacoRenderer } from './MonacoRenderer';
import { ResourceRenderer } from './ResourceRenderer';
import { ResourceRefRender } from './ResourceRefRenderer';
import { SimpleList } from './SimpleList';

export const customWidgets = {
  /*
  Accordions: AccordionsRenderer,
  */
  Text: StringRenderer,
  Number: NumberRenderer,
  /*
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
  ResourceRefs: ResourceRefRender,
  Resource: ResourceRenderer,
};
